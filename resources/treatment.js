/**
 * All API calls for treatment.
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

router.post('/add', function (req, res) {
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;

    console.log("start date: " + start_date);
    console.log("end date: " + end_date);

    var query = 'INSERT INTO treatment (start_date, end_date) VALUES ("' + start_date + '", "' + end_date + '");';

    connection.query(query, function (err) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(400).send("Foute aanvraag");
            return;
        }

        res.status(201).send("Behandelplan gecreëerd");
    })
});

router.get('/exercises-day', function (req, res) {
    // TODO token
    var date = req.header('date');

    // TODO token check
    var query = 'SELECT *   ' +
        'FROM exercise ' +
        'INNER JOIN treatment_exercise.exerciseId = exercise.exerciseId ' +
        'WHERE todo_datetime = ' + date;

    connection.query(query, function (err, result) {
        if (err){
            res.status(404).send("Niet gevonden");
            return;
        }

        res.status(200).json(result);
    });
});

router.put('/exercises-done', function (req, res) {
    // TODO token
    var exerciseId = req.body.exerciseId;
    var done = req.body.done;

    // TODO token check
    var query = 'UPDATE treatment SET done = ' + done + ' WHERE exercise_id = ' + exerciseId;

    connection.query(query, function(err, done){
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot find exercise with the given ID!");
            return;
        }

        res.status(200).send(done);
    });
});