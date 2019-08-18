const express = require('express');
const passport = require('passport');
const { google } = require('googleapis');
const GoogleStrategy = require( 'passport-google-oauth2').Strategy;

const contacts = google.people({
    version: 'v1'
});

const app = express();

passport.use(new GoogleStrategy(
    {
        clientID: '418536006173-s2ikp4074hsjc97l4n9kr85seool16ll.apps.googleusercontent.com',
        clientSecret: 'sLe8aCi5gbFfsGCFzdXO40Xq',
        callbackURL: "http://localhost:8100/auth/callback",
    },
    function(accessToken, refreshToken, profile, done) {
        console.log('profile', profile);
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2();
        console.log('tokens', accessToken);
        oauth2Client.setCredentials({ access_token: accessToken });
        contacts.people.connections.list({
            resourceName: 'people/me',
            personFields: 'names,emailAddresses,phoneNumbers',
            auth: oauth2Client,
        }, (err, res) => {
            if (err) {
                console.log('err', err);
                done(null, profile);
                return;
            }
            done(null, profile);

            console.log('got emails', res.data.connections);
        })
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use(passport.initialize());

app.get('/auth', passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/contacts.readonly',
        'https://www.google.com/m8/feeds/',
        'profile',
        'email'
    ],
    display: 'popup',
}));

app.get('/auth/callback', passport.authenticate('google', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure'
}));

app.get('/auth/success', (req, res) => {
    console.log('auth/success');
    res.status(200).redirect('http://localhost:3000');
});

app.get('/auth/failure', (req, res) => {
    console.log('auth/failure');
});

app.listen(8100, () => console.log('server started'));
