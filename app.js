require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
//const ejs = require('ejs');
const mongoose = require('mongoose');
//const mongooseEncryption = require('mongoose-encryption');
//const md5 = require('md5');
const bcryptJs = require('bcryptjs');

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

const salt = process.env.SALT;
//const secret = process.env.SECRET;

// userSchema.plugin(mongooseEncryption,
//                  {
//                     secret: secret,
//                     encryptedFields: ['password']
//                  });

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
                password: bcryptJs.hashSync(req.body.password, salt)
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

        User.findOne({email: username})
            .then( foundUser => {
                if (foundUser) {                    
                    const password = req.body.password;
                    
                    if ( bcryptJs.compareSync(password, foundUser.password) ) res.render('secrets.ejs');
                    else res.redirect('/login');
                }
                else res.redirect('/login');          
            })
            .catch( err => {
                console.log(err);
            });
    });

app.route('/logout')
    .get( (req, res) => {
        res.redirect('/');    
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
        res.render('secrets.ejs'); 
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
