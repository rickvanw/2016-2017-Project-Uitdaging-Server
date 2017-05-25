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

/**
 * Post method for creating a new treatment.
 */
router.post('/add', function (req, res) {
    // TODO Als er al een behandelplan bestaat voor de user, mag er niet een nieuwe worden gegenereerd!
    console.log("JOEgegergrRR");
    var user_id = req.decoded.user_id;
    var start_date = utils.getCurrentDate();
    var end_date = utils.getEndDate();

    console.log("----- start treatment creation!");
    console.log("user id: " + user_id);
    console.log("start date: " + start_date);
    console.log("end date: " + end_date);

    // TESTING
    // var query = 'INSERT INTO treatment (user_id, start_date, end_date) VALUES ("' + user_id + '", "' + start_date + '", "' + end_date + '");';
    var query = 'INSERT INTO test_treatment (user_id, start_date, end_date) VALUES ("' + user_id + '", "' + start_date + '", "' + end_date + '");';

    connection.query(query, function (err) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(400).send("Foute aanvraag");
            return;
        }

        // if the treatment is created, the function for generating exercises will be called
        generateExercises(req, res);

        res.status(201).send("Behandelplan gecreëerd");
    });

    console.log("----- end treatment creation!");
    console.log("");
});

/**
 * Get method for showing all exercises of a certain day.
 */
router.get('/exercises-day', function (req, res) {
    var user_id = req.decoded.user_id;
    var date = req.header('day');

    console.log("user id: " + user_id);
    console.log("Date: " + date);

    var query = 'SELECT e.*, te.rating_user, te.done FROM exercise AS e '+
    'INNER JOIN treatment_exercise AS te ON te.exercise_id = e.exercise_id '+
    'INNER JOIN treatment AS t ON t.treatment_id = te.treatment_id '+
    'WHERE t.user_id = ' + user_id + ' '+
    'AND t.end_date >= "' + utils.getCurrentDate() + '" '+
    'AND t.start_date <= "' + utils.getCurrentDate() + '" ' +
    'AND te.todo_date = "' + date + '"';

    connection.query(query, function (err, result) {
        if (err){
            res.status(404).send("Niet gevonden");
            return;
        }
        console.log("result: " + result);
        res.status(200).json(result);
    });
});

/**
 * PUT method for marking exercises as done or undone.
 */
router.put('/exercise-done', function (req, res) {
    var exerciseId = req.body.exerciseId;
    var done = req.body.isDone;
    var user_id = req.decoded.user_id;

    console.log("** user_id: " + user_id);
    console.log("** exerciseId: " + exerciseId);
    console.log("** done: " + done);

    // TODO token check
    var query;
    if (done == 1) {
        query = 'UPDATE treatment_exercise AS te '+
            'INNER JOIN treatment AS t ON t.treatment_id = te.treatment_id '+
            'SET te.done = 1 '+
            'WHERE t.user_id = '+ user_id +' '+
            'AND te.exercise_id = '+ exerciseId + ' '+
            'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
            'AND t.start_date <= "' + utils.getCurrentDate() +'" ';
    }else{
        query = 'UPDATE treatment_exercise AS te '+
            'INNER JOIN treatment AS t ON t.treatment_id = te.treatment_id '+
            'SET te.done = -1 '+
            'WHERE t.user_id = '+ user_id +' '+
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

        console.log("succes!");
        res.status(200).send(done);
    });
});


/**
 * Function for generating exercises which will be added to the treatment.
 */
function generateExercises(req, res) {
    // TODO: exercises moeten worden gegenereerd met een todo_time om het uur!
    var user_id = req.decoded.user_id;
    var current_date = utils.getCurrentDate();

    console.log("----- start exercise generation!");
    console.log("** user_id: " + user_id);
    console.log("** current_date: " + current_date);

    // TESTING
    // var query = 'SELECT exercise_id FROM complaint_exercise AS ce ' +
    //     'INNER JOIN user_complaint AS uc ON uc.complaint_id = ce.complaint_id ' +
    //     'WHERE uc.user_id = ' + user_id;
    var query = 'SELECT exercise_id FROM complaint_exercise AS ce ' +
        'INNER JOIN test_user_complaint AS uc ON uc.complaint_id = ce.complaint_id ' +
        'WHERE uc.user_id = ' + user_id;

    connection.query(query, function (err, result) {
        if (err) {
            console.log("Error: " + err);
        }

        for(i = 0; i < result.length; i++){
            var exercise_id = result[i].exercise_id;
            console.log("\texercise_id: " + exercise_id);
            // TESTING
            // var query = 'INSERT INTO treatment_exercise (treatment_id, exercise_id, todo_date, todo_time) ' +
            //     'VALUES ((SELECT te.treatment_id FROM treatment AS te ' +
            //     'WHERE "' + current_date + '" between te.start_date AND te.end_date ' +
            //     'AND te.user_id = ' + user_id + '), ' + exercise_id + ', "' + utils.getCurrentDate() + '", "' + utils.getCurrentTime() + '")';
            var query = 'INSERT INTO test_treatment_exercise (treatment_id, exercise_id, todo_date, todo_time) ' +
                'VALUES ((SELECT te.treatment_id FROM test_treatment AS te ' +
                'WHERE "' + current_date + '" between te.start_date AND te.end_date ' +
                'AND te.user_id = ' + user_id + '), ' + exercise_id + ', "' + utils.getCurrentDate() + '", "' + utils.getCurrentTime() + '")';

            connection.query(query, function (err, result) {
                if (err) {
                    console.log("Error: " + err);
                }

                console.log("Succes!");
            });
        }
    });

    console.log("----- end exercise generation!");
}
