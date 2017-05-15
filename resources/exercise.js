/**
 * All API calls for exercise.
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

router.get('', function (req, res) {
    // TODO token
    var exerciseId = req.header('exerciseId');

    // TODO token check
    var query = 'SELECT * FROM exercise WHERE exercise_id = ' + exerciseId;

    connection.query(query, function (err, exercise) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot find exercise with the given ID!");
            return;
        }

        res.status(200).json(exercise);
    })
});

router.put('/rate', function (req, res) {
    // TODO token
    var exerciseId = req.body.exerciseId;
    var rating = req.body.rating;

    // TODO token check
    var query = 'UPDATE exercise SET rating = ' + rating + ' WHERE exercise_id = ' + exerciseId;

    connection.query(query, function (err, rating) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot find exercise with the given ID!");
            return;
        }

        res.status(200).send(rating);
    })
});