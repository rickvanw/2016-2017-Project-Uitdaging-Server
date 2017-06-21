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
    });
});

router.get('/rows', function (req, res) {
    var exerciseId = req.header('exerciseId');
    var query = 'SELECT count(*) FROM exercise';

    connection.query(query, function (err, exercise) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot calculate the amount of rows");
            return;
        }

        res.status(200).json(exercise);
    })
});

router.get('/admin-exercise-page', function (req, res) {
    var page = req.header('page');
    var previousAmount = (page + "0")-10;

    console.log("previousAmount: "+previousAmount + "page: "+page);

    var query =
    'SELECT e.*, ' +
        'COUNT(CASE WHEN te.rating_user = 1 THEN 1 ELSE NULL END) AS likes, ' +
        'COUNT(CASE WHEN te.rating_user = -1 THEN 1 ELSE NULL END) AS dislikes, ' +
        'COUNT(CASE WHEN te.done = 1 THEN 1 ELSE NULL END) AS done, ' +
        'COUNT(CASE WHEN te.done = -1 THEN 1 ELSE NULL END) AS notdone ' +
    'FROM exercise AS e ' +
    'LEFT JOIN treatment_exercise AS te ON te.exercise_id = e.exercise_id ' +
    'GROUP BY e.exercise_id ' +
    'ORDER BY name ' +
    'LIMIT ' + previousAmount + ', 10';

    connection.query(query, function (err, exercise) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot find exercises!");
            return;
        }

        res.status(200).json(exercise);
    })
});

router.get('/likes-dislikes', function (req, res) {
    var exerciseId = req.header('exerciseId');

    var query = 'SELECT COUNT(CASE WHEN rating_user = 1 THEN 1 ELSE NULL END) AS likes, ' +
        'COUNT(CASE WHEN rating_user = -1 THEN 1 ELSE NULL END) AS dislikes '+
        'FROM treatment_exercise '+
        'WHERE exercise_id = '+ exerciseId;

    connection.query(query, function (err, exercise) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot find exercises!");
            return;
        }

        res.status(200).json(exercise);
    })
});

router.get('/done-notdone', function (req, res) {
    var exerciseId = req.header('exerciseId');

    var query = 'SELECT COUNT(CASE WHEN done = 1 THEN 1 ELSE NULL END) AS done, ' +
        'COUNT(CASE WHEN done = -1 THEN 1 ELSE NULL END) AS notdone '+
        'FROM treatment_exercise '+
        'WHERE exercise_id = '+ exerciseId;

    connection.query(query, function (err, exercise) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot find exercises!");
            return;
        }

        res.status(200).json(exercise);
    })
});

router.put('/rate', function (req, res) {
    var treatment_exercise_id = req.body.treatment_exercise_id;
    var rating = req.body.rating;
    var user_id = req.decoded.user_id;
    var query="";

    // TODO user can only rate one exercise once
    //var userId = req.decoded.user_id;

    console.log("RATING: "+rating);

    if (rating==1){
        // Like
        query =
        'UPDATE treatment_exercise AS te '+
        'INNER JOIN treatment AS t ON t.treatment_id = t.treatment_id '+
        'INNER JOIN exercise AS e ON te.exercise_id = e.exercise_id '+
        'SET te.rating_user = 1, e.rating = rating+1 '+
        'WHERE t.user_id = ' + user_id + ' '+
        'AND te.treatment_exercise_id = '+ treatment_exercise_id + ' '+
        'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
        'AND t.start_date <= "' + utils.getCurrentDate() +'" ';
    }else{
        // Dislike
        query =
            'UPDATE treatment_exercise AS te '+
            'INNER JOIN treatment AS t ON t.treatment_id = t.treatment_id '+
            'INNER JOIN exercise AS e ON te.exercise_id = e.exercise_id '+
            'SET te.rating_user = -1, e.rating = rating-1 '+
            'WHERE t.user_id = ' + user_id + ' '+
            'AND te.treatment_exercise_id = '+ treatment_exercise_id + ' '+
            'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
            'AND t.start_date <= "' + utils.getCurrentDate() +'" ';
    }

    connection.query(query, function (err, rating) {
        if (err) {
            console.log(err.message);
            res.status(404).send("Cannot find exercise with the given ID!");
            return;
        }

        res.status(200).send(rating);
    });
});

router.delete('', function (req, res) {
    var exercise_id = req.body.exercise_id;
    console.log("----- DELETE exercise");
    console.log("** ID: " + exercise_id);

    var query = 'DELETE FROM exercise WHERE exercise_id = ' + exercise_id;

    connection.query(query, function (err, result) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot find exercise with the given ID!");
            return;
        }
        console.log("** succes!");

        res.status(200).send(result);
    });
});

router.post('', function (req, res){
    var name = req.body.exercise_name;
    var description = req.body.description;
    var media_url = req.body.media_url;
    var image_url = req.body.image_url;
    var repetitions = req.body.repetitions;
    var rating = 0;
    var active = 1;

    console.log();
    console.log("----- start posting exercise");
    console.log("** Name: " + name);
    console.log("** Description: " + description);
    console.log("** media_url: " + media_url);
    console.log("** image_url: " + image_url);
    console.log("** repetitions: " + repetitions);
    console.log("** Rating: " + rating);
    console.log("** Active: " + active);

    (function () {
        var query = 'INSERT INTO exercise (name, description, media_url, image_url, repetitions, rating, active) ' +
            'VALUES ("' + name + '", "' + description + '", "' + media_url + '", "' + image_url + '", ' +
            repetitions + ', ' + rating + ', ' + active + ');';

        connection.query(query, function (err, result) {
            if (err) {
                console.log(err.message);
                res.status(404).send("Cannot post exercise");
                return;
            }

            console.log("Succes!");
            res.status(200).send();
        });
    })();

    console.log("----- end posting exercise successfully!");
    console.log();
});

router.post('', function (req, res) {
    var exercise_id = req.body.exercise_id;
    var name = req.body.name;
    var description = req.body.description;
    var repetitions = req.body.repetitions;
    var media_url = req.body.media_url;

    console.log("DES: " + description);

    var query = 'UPDATE exercise SET name = "'+name+ '", ' +
        'description = "' + description+ '", '+
        'repetitions = "' + repetitions+ '", '+
        'media_url = "' + media_url+ '" '+
        'WHERE exercise_id = "' + exercise_id+'"';

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