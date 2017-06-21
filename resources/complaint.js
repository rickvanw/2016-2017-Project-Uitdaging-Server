/**
 * All API calls for complaint
 *
 * Created by rickv, maurice_2 on 15-5-2017.
 */
var express = require('express');
var request = require('request');
var router = express.Router();

module.exports = router;

var fs = require('fs');

var connection = require('./connection.js');
var config = require('./config.js');
var utils = require('./utils.js');

/**
 * GET all complaints in array
 */
// router.get('', function (req, res) {
//
//     var query = "SELECT * FROM complaint";
//     connection.query(query, function (err, result) {
//         if (err){
//             res.status(400).json("ERROR");
//             return;
//         }
//         res.status(200).json(result);
//     });
// });

router.get('', function (req, res) {
    console.log("checkkk");
    var user_id = req.decoded.user_id;
    console.log("check " + user_id);

    var query = "SELECT c.name FROM complaint AS c " +
        "INNER JOIN user_complaint AS uc ON uc.complaint_id = c.complaint_id " +
        "WHERE uc.user_id = " + user_id;

    connection.query(query, function (err, result) {
        if (err){
            res.status(400).json("ERROR");
            return;
        }

        console.log("&&&&&&&succes");
        console.log(result);
        res.status(200).json(result);
    });
});

