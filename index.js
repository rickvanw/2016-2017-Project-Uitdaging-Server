/**
 * Created by rickv on 15-5-2017.
 */
// Add dependencies
var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('./resources/config.js');
var mysql = require('mysql');
var utils = require('./resources/utils.js');
var bodyparser = require('body-parser');


var app = express();

var publicUrls = ["/user/add", "/user/login", "/user/password-reset-req", "/user/password-reset-confirm"];
var adminUrls = ["/user/add-admin", "/exercise", "/exercise/admin-exercise-page"];


/*
 * Fixing cross domain problems
 */
var cors = require('cors');
app.use(cors());


/**
 * called for every api call, to check authorization
 */
app.use(function (req, res, next) {
    //console.log(JSON.stringify(req.headers));

    //console.log("request " + req.url);
    if (isPublic(req.url)) {
        next();
        return;
    }

    // Retrieve the token.
    var token = req.headers['authorization'];

    // Verify the token based on the secret saved on the server.
    jwt.verify(token, config.secretKey, function (err, decoded) {
        // If something went wrong the user is not authorized to perform the action.
        if (err) {
            utils.error(401, err, res);
        } else {
            // Save the decoded payload to be used in the API calls.
            req.decoded = decoded;

            if(isAdmin(req.url, req.method)){
                //console.log("ADMIN URL");
                if(req.decoded.role_id != 1) {
                    //console.log("ADMIN NOT AUTHORIZED");
                    utils.error(401, err, res);
                }else{
                    //console.log("ADMIN AUTHORIZED");
                    next();
                }
            }else{
                next();
            }
        }
    });
});

function isPublic(url) {
    for (var item in publicUrls) {
        if (url == (publicUrls[item])) {
            //console.log("PUBLIC");
            return true;
        }
    }
    return false;
}

function isAdmin(url, method) {
    for (var item in adminUrls) {
        if (url == (adminUrls[item])) {

            // Check for exceptions
            if(method == "GET" && (url == "/exercise")){
                return false;
            }

            //console.log("ADMIN");
            return true;
        }
    }
    return false;
}

app.use(bodyparser.urlencoded({
    extended: true
}));

//--------------starting server-------------

app.listen(8000, function () {
    //console.log("opened on port 8000");
});



//--------------setting routers---------------

var complaint = require("./resources/complaint.js");
app.use('/complaint', complaint);

var evaluation = require("./resources/evaluation.js");
app.use('/evaluation', evaluation);

var exercise = require("./resources/exercise.js");
app.use('/exercise', exercise);

var treatment = require("./resources/treatment.js");
app.use('/treatment', treatment);

var user = require("./resources/user.js");
app.use('/user', user);
