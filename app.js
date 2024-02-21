require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set( 'view engine', 'ejs' );
app.use( express.static('public') );
app.use( bodyParser.urlencoded(
    {
        extended: true
    })
);
app.use( session(
    {
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false
    }
));
app.use( passport.initialize() );
app.use( passport.session() );

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            require: true
        },
        password: {
            type: String,
            require: true
        }
    }
);
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model('user', userSchema);

passport.use( User.createStrategy() );
passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );

app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.route('/register')
    .get( (req, res) => {
        res.render('register.ejs');
    })
    .post( (req, res) => {
        User.register( {username: req.body.username}, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect('/register');
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/secrets');
                });
            }
        } );
    })

app.route('/login')
    .get( (req, res) => {
        res.render('login.ejs');
    })
    .post( (req, res) => {
        const user = new User(
            {
                username: req.body.username,
                password: req.body.password
            }
        );

        req.logIn(user, (err) => {
            if (err) {
                console.log(err);
                res.redirect('/login');
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/secrets');
                });
            }
        });
    });

app.route('/logout')
    .get( (req, res) => {
        req.logout( (err) => {
            if (err) console.log(err);
            res.redirect('/');
        });
    });

app.route('/submit')
    .get( (req, res) => {
        res.render('submit.ejs');    
    })
    .post( (req, res) => {
        res.redirect('/secrets');    
    });

app.route('/secrets')
    .get( (req, res) => {
        if ( req.isAuthenticated() ) res.render('secrets.ejs'); 
        else res.redirect('/login');
    });

mongoose.connect('mongodb://127.0.0.1:27017/userDB')
    .then( () => {
        console.log('MongoDB connected');
        app.listen(3000, () => {
            console.log('Server started on port 3000')
        });
    })
    .catch( err => {
        console.log(err);
    });
