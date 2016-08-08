var express = require('express');
var mongoose = require('mongoose');
var port = process.env.PORT || 3000;
var app = express();


// configure our server with all the middleware and routing
require('./config/middleware.js')(app, express);

// start listening to requests on port 8000
app.listen(port);

// export our app for testing and flexibility, required by index.js
module.exports = app;
