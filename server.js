'use strict';

// ================================================================
// get all the tools we need
// ================================================================
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index.js');
const port = process.env.PORT || 3000;
const cors = require('cors')
var app = express();
const pass = require('./configuration/mongopass');
const mongoose = require('mongoose');

// ================================================================
// setup our express application
// ================================================================
app.use('/public', express.static(process.cwd() + '/public'));
app.set('view engine', 'ejs');
app.use(express.json({extended: true, limit: '10mb'}))
app.use(cookieParser());
app.use(cors({origins: '*'}));

mongoose.connect('mongodb+srv://tech-factory:' + pass.password + '@cluster0.nrbfbgp.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log("connexion db OK !")
    }).catch(err => {
        console.log(err);
    }
);
app.locals.baseURL = process.env.BASE_URL || 'http://localhost:3000/'
// ================================================================
// setup routes
// ================================================================
routes(app);

// ================================================================
// start our server
// ================================================================
app.listen(port, function() {
    console.log('Server listening on port ' + port + '...');
});