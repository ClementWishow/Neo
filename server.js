'use strict';

// ================================================================
// get all the tools we need
// ================================================================
const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const routes = require('./routes/index.js');
const port = process.env.PORT || 3000;
const cors = require('cors')
var app = express();

// ================================================================
// setup our express application
// ================================================================
app.use('/public', express.static(process.cwd() + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors())
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