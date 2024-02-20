require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const mongooseEncryption = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

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

const secret = process.env.SECRET;

userSchema.plugin(mongooseEncryption,
                 {
                    secret: secret,
                    encryptedFields: ['password']
                 });

const User = new mongoose.model('user', userSchema);

app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.route('/register')
    .get( (req, res) => {
        res.render('register.ejs');
    })
    .post( (req, res) => {
        const newUser = new User(
            {
                email: req.body.username,
                password: req.body.password
            }
        );

        newUser.save()
            .then( () => {
                console.log('User saved');
                res.render('secrets.ejs')
            })
            .catch( err => {
                console.log(err);
            });
    })

app.route('/login')
    .get( (req, res) => {
        res.render('login.ejs');        
    })
    .post( (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username})
            .then( foundUser => {
                if (foundUser) {
                    if (foundUser.password === password) res.render('secrets.ejs');
                    else res.redirect('/login');
                }
                else res.redirect('/login');          
            })
            .catch( err => {
                console.log(err);
            });
    });
    
/*
get'/'
get+post'/login'
get+post'/register'
get+post'/submit'
*/

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
