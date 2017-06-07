/**
 * All API calls for user.
 *
 * Created by rickv, maurice_2 on 15-5-2017.
 */
var express = require('express');
var request = require('request');
var router = express.Router();

module.exports = router;

var fs = require('fs');

var jwt = require('jsonwebtoken');
var connection = require('./connection.js');
var config = require('./config.js');
var utils = require('./utils.js');

/**
 * GET method for showing info of logged in user.
 */
router.get('', function (req, res) {

    var user_id = req.decoded.user_id;

    var query = "SELECT role_id, email, first_name, last_name FROM user WHERE user_id = " + user_id;
    connection.query(query, function (err, result) {
        if (err){
            res.status(400).json([]);
            return;
        }
        res.status(200).json(result);
    });
});

/**
 * POST method for creating a new user.
 */
router.post('/add', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;

    var query = 'INSERT INTO user(email, password, first_name, last_name) VALUES ("'+email+'","'+password+'","'+first_name+'","'+last_name+'")';

    console.log(query);

    connection.query(query, function (err) {
        if (err) {
            console.log(err.message);
            utils.error(409, 'Already exists', res);
            return;
        }
        res.status(201).send();
    })
});

/**
 * PUT method for changing personal data.
 */
router.put('/change', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;

    var user_id = req.decoded.user_id;

    var query = 'UPDATE user SET email= "'+email+'", password= "'+password+'", first_name= "'+first_name+'", last_name= "'+last_name+'" WHERE user_id='+user_id+'';

    console.log(query);

    connection.query(query, function (err) {
        if (err) {
            console.log(err.message);
            utils.error(409, 'Already exists', res);
            return;
        }
        res.status(201).send();
    })
});

/**
 * POST method for sending complaints which the user has selected for generating a new treatment.
 */
router.post('/complaint/add', function (req, res) {
    var user_id = req.decoded.user_id;
    var query = "";
    var complaint_ids = JSON.parse(req.body.complaint_ids);

    console.log();
    console.log();
    console.log("**************************** CHECK FOR POSTING COMPLAINTS **********************************");
    console.log("** user_id: " + user_id);

    query = 'SELECT treatment_id FROM treatment WHERE user_id = ' + user_id;

    connection.query(query, function (err, result) {
        if (err) {
            console.log("Error: " + err);
        }

        var treatment_id;

        for (i = 0; i < result.length; i++) {
            treatment_id = result[i].treatment_id;
        }
        console.log("** treatment_id: " + treatment_id);

        if (treatment_id !== undefined) {
            console.log("Treatment earlier defined for user with id " + user_id);
            res.status(406).send("Treatment already defined!");
        } else {
            console.log("** Treatment not earlier defined, so allowed to post complaints!");
            console.log();
            console.log("----- start posting complaints");
            (function () {
                for (i = 0; i < complaint_ids.length; i++) {
                    var complaint_id = complaint_ids[i];
                    console.log("complaint " + (i + 1) + " with complaint id: " + complaint_id);

                    query = 'INSERT INTO user_complaint (user_id, complaint_id) VALUES ("' + user_id + '", "' + complaint_id + '");';

                    connection.query(query, function (err, i) {
                        if (err) {
                            console.log(err.message);
                            // utils.error(409, 'Already exists', res);
                            res.status(400).send("Bad request");
                            return;
                        }

                        res.status(201).send();
                    });
                }
            })();
            console.log("----- end posting complaints successfully!");
            console.log();
        }
    });
});

/**
 * POST method for login.
 */
router.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    connection.query('SELECT user_id, role_id, password FROM user WHERE email = "' + email + '"', function (err, result) {
        if (err) {
            utils.error(500, "Something went wrong server side, please try again later", res);
            throw err;
        }

        if (result[0] === undefined) {
            console.log("Wrong name");
            utils.error(401, 'User with given username not found', res);
        }
        else if(result[0].password === password) {
            // Check if password is correct
            res.status(200);
            var token = jwt.sign({email: email, user_id: result[0].user_id, role_id: result[0].role_id}, config.secretKey, {expiresIn: config.tokenExpiresIn});
            res.send({token: token});
        }
        else {
            // Incorrect password
            console.log("Wrong pass");
            utils.error(401, 'Incorrect password', res);

        }
    });
});