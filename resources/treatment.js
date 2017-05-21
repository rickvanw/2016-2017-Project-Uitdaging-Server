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
    console.log("JOEgegergrRR");
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
    var user_id = req.decoded.user_id;
    var date = req.header('day');
    console.log(JSON.stringify(req.headers));
    console.log("Date: " + date);

    // TODO token check
    var query = 'SELECT e.*, te.rating_user, te.done FROM exercise AS e '+
    'INNER JOIN treatment_exercise AS te ON e.exercise_id = te.exercise_id '+
    'INNER JOIN user_treatment AS ut ON te.treatment_id = ut.treatment_id '+
    'INNER JOIN treatment AS t ON ut.treatment_id = t.treatment_id '+
    'WHERE ut.user_id = '+ user_id + ' '+
    'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
    'AND t.start_date <= "' + utils.getCurrentDate() +'" '+
    'AND todo_datetime = "' + date +'" ';

    connection.query(query, function (err, result) {
        if (err){
            res.status(404).send("Niet gevonden");
            return;
        }
        res.status(200).json(result);
    });
});

router.put('/exercise-done', function (req, res) {
    // TODO token

    var exerciseId = req.body.exerciseId;
    var done = req.body.done;
    var user_id = req.decoded.user_id;

    // TODO token check
    var query;
    if (done == 1) {
        query = 'UPDATE treatment_exercise AS te '+
            'INNER JOIN user_treatment AS ut ON te.treatment_id = ut.treatment_id '+
            'INNER JOIN treatment AS t ON ut.treatment_id = t.treatment_id '+
            'SET te.done = 1 '+
            'WHERE ut.user_id = '+ user_id +' '+
            'AND te.exercise_id = '+ exerciseId + ' '+
            'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
            'AND t.start_date <= "' + utils.getCurrentDate() +'" ';
    }else{
        query = 'UPDATE treatment_exercise AS te '+
            'INNER JOIN user_treatment AS ut ON te.treatment_id = ut.treatment_id '+
            'INNER JOIN treatment AS t ON ut.treatment_id = t.treatment_id '+
            'SET te.done = -1 '+
            'WHERE ut.user_id = '+ user_id +' '+
            'AND te.exercise_id = '+ exerciseId + ' '+
            'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
            'AND t.start_date <= "' + utils.getCurrentDate() +'" ';
    }

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

