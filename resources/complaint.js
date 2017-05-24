/**
 * All API calls for complaint
 *
 * Created by rickv, maurice_2 on 15-5-2017.
 */
var express = require('express');
var request = require('request');
var router = express.Router();

module.exports = router;

var connection = require('./connection.js');
var config = require('./config.js');
var utils = require('./utils.js');

/**
 * GET all complaints in array
 */
router.get('', function (req, res) {

    var query = "SELECT * FROM complaint";
    connection.query(query, function (err, result) {
        if (err){
            res.status(400).json("ERROR");
            return;
        }
        res.status(200).json(result);
    });
});

// Add instructor to module_year
router.post('/add', function (req, res) {
    var user_id = req.decoded.user_id;
    var complaint_id = req.body.complaint_id;

    //var query = 'insert into complaint(name) values()';
    var query = 'INSERT INTO user_complaint(user_id, complaint_id) VALUES ("' + user_id + ', ' + complaint_id + '")';

    connection.query(query, function (err) {
        if (err) {
            console.log(err.message);
            return;
        }
        res.status(201).send();
    })
});