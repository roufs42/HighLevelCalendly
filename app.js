var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var events = require('./routes/events');

var app = express();
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



app.use('/api',events.routes);


module.exports = app;
