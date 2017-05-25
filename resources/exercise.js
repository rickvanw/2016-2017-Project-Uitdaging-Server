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
    var exerciseId = req.header('exerciseId');
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
    var exerciseId = req.body.exerciseId;
    var rating = req.body.rating;
    var user_id = req.decoded.user_id;
    var query="";

    // TODO user can only rate one exercise once
    //var userId = req.decoded.user_id;


    if (rating==1){
        // Like
        query =
        'UPDATE treatment_exercise AS te '+
        'INNER JOIN treatment AS t ON te.treatment_id = t.treatment_id '+
        'INNER JOIN exercise AS e ON te.exercise_id = e.exercise_id '+
        'SET te.rating_user = 1, e.rating = rating+1 '+
        'WHERE te.user_id = ' + user_id + ' '+
        'AND te.exercise_id = '+ exerciseId + ' '+
        'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
        'AND t.start_date <= "' + utils.getCurrentDate() +'" ';
    }else{
        // Dislike
        query =
            'UPDATE treatment_exercise AS te '+
            'INNER JOIN treatment AS t ON te.treatment_id = t.treatment_id '+
            'INNER JOIN exercise AS e ON te.exercise_id = e.exercise_id '+
            'SET te.rating_user = -1, e.rating = rating-1 '+
            'WHERE te.user_id = ' + user_id + ' '+
            'AND te.exercise_id = '+ exerciseId + ' '+
            'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
            'AND t.start_date <= "' + utils.getCurrentDate() +'" ';
    }


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