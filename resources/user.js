var express = require('express');
var request = require('request');
var router = express.Router();

module.exports = router;

var jwt = require('jsonwebtoken');
var connection = require('./connection.js');
var config = require('./config.js');
var utils = require('./utils.js');

/**
 * GET info of logged in user
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

router.post('/add', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;


    //var query = 'insert into complaint(name) values()';
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

router.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    connection.query('SELECT user_id, role_id, password FROM user WHERE email = "' + email + '"', function (err, result) {
        if (err) {
            utils.error(500, "Something went wrong server side, please try again later", res);
            throw err;
        }

        if (result[0] === undefined) {
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
            utils.error(401, 'Incorrect password', res);
        }
    });
});
