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

router.get('complaint-names', function (req, res) {
    var query = "SELECT c.name, tc.treatment_id FROM complaint " +
        "INNER JOIN treatment_complaint ON tc.complaint_id = c.complaint_id" +
        "INNER JOIN treatment ON treatment.treatment_id = tc.treatment_id";

    connection.query(query, function (err, result) {
        if (err){
            res.status(400).json("ERROR");
            return;
        }
        res.status(200).json(result);
    });
});

