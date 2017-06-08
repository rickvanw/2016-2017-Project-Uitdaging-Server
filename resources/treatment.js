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

var getExercise = false;

/**
 * Get method for getting the current treatment for a user
 */
router.get('/to-evaluate', function (req, res) {
    var user_id = req.decoded.user_id;

    console.log("user id: " + user_id);

    var query = 'SELECT * FROM treatment ' +
        'WHERE user_id ='+ user_id + ' '+
        'AND done = 0 ' +
        'AND end_date < "' + utils.getCurrentDate() +'" ';


    connection.query(query, function (err, result) {
        if (err){
            res.status(404).send("Not found");
            return;
        }
        res.status(200).json(result);
    });
});

/**
 * Post method for creating a new treatment.
 */
router.post('/add', function (req, res) {
    console.log("JOEgegergrRR");
    var user_id = req.decoded.user_id;
    var start_date = utils.getCurrentDate();
    var end_date = utils.getEndDate();

    console.log();
    console.log("----- start treatment creation!");
    console.log("user id: " + user_id);
    console.log("start date: " + start_date);
    console.log("end date: " + end_date);

    // TESTING
    // var query = 'INSERT INTO treatment (user_id, start_date, end_date) VALUES ("' + user_id + '", "' + start_date + '", "' + end_date + '");';
    var query = 'INSERT INTO treatment (user_id, start_date, end_date) VALUES ("' + user_id + '", "' + start_date + '", "' + end_date + '");';

    connection.query(query, function (err) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(400).send("Bad request");
            return;
        }

        // if the treatment is created, the function for generating exercises will be called
        checkForExerciseGeneration(req, res);

        res.status(201).send("Treatment created!");
    });

    console.log("----- end treatment creation!");
});

/**
 * Get method for showing all exercises of a certain day.
 */
router.get('/exercises-day', function (req, res) {

    getExercise = true;
    checkForExerciseGeneration(req, res);


});

function getExercises(req, res){
    getExercise = false;

    var user_id = req.decoded.user_id;
    var date = req.header('day');
    console.log("user id: " + user_id);
    console.log("Date: " + date);

    var query = 'SELECT e.*, te.rating_user, te.done, te.treatment_exercise_id FROM exercise AS e '+
        'INNER JOIN treatment_exercise AS te ON e.exercise_id = te.exercise_id '+
        'INNER JOIN treatment AS t ON te.treatment_id = t.treatment_id '+
        'WHERE t.user_id = '+ user_id + ' '+
        'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
        'AND t.start_date <= "' + utils.getCurrentDate() +'" '+
        'AND todo_date = "' + date +'" ';

    connection.query(query, function (err, result) {
        if (err){
            res.status(404).send("Not found");
            return;
        }
        res.status(200).json(result);
    });
}

//TODO per tijdstip maken
router.get('/exercise-now', function (req, res) {
    var user_id = req.decoded.user_id;
    var query = "";
    console.log(JSON.stringify(req.headers));

    query = 'SELECT e.*, te.rating_user, te.done, te.treatment_exercise_id FROM exercise AS e '+
        'INNER JOIN treatment_exercise AS te ON e.exercise_id = te.exercise_id '+
        'INNER JOIN treatment AS t ON te.treatment_id = t.treatment_id '+
        'WHERE t.user_id = '+ user_id + ' '+
        'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
        'AND t.start_date <= "' + utils.getCurrentDate() +'" '+
        'AND todo_date = "'+ "2017-06-07"+'" ' +
        'LIMIT 1';
    query = 'SELECT e.*, te.rating_user, te.done FROM exercise AS e '+
    'INNER JOIN treatment_exercise AS te ON te.exercise_id = e.exercise_id '+
    'INNER JOIN treatment AS t ON t.treatment_id = te.treatment_id '+
    'WHERE t.user_id = ' + user_id + ' '+
    'AND t.end_date >= "' + utils.getEndDate() + '" '+
    'AND t.start_date <= "' + utils.getCurrentDate() + '" ' +
    'AND te.todo_date = "' + date + '"';

    connection.query(query, function (err, result) {
        if (err){
            res.status(404).send("Not found");
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
    var treatment_exercise_id = req.body.treatment_exercise_id;
    var done = req.body.done;
    var user_id = req.decoded.user_id;

    console.log("** user_id: " + user_id);
    console.log("** exerciseId: " + treatment_exercise_id);
    console.log("** done: " + done);

    // TODO token check
    var query;
    if (done == 1) {
        query = 'UPDATE treatment_exercise AS te '+
            'INNER JOIN treatment AS t ON te.treatment_id = t.treatment_id '+
            'SET te.done = 1 '+
            'WHERE t.user_id = '+ user_id +' '+
            'AND te.treatment_exercise_id = '+ treatment_exercise_id + ' '+
            'AND t.end_date >= "' + utils.getCurrentDate() +'" '+
            'AND t.start_date <= "' + utils.getCurrentDate() +'" ';
    }else{
        query = 'UPDATE treatment_exercise AS te '+
            'INNER JOIN treatment AS t ON te.treatment_id = t.treatment_id '+
            'SET te.done = -1 '+
            'WHERE t.user_id = '+ user_id +' '+
            'AND te.treatment_exercise_id = '+ treatment_exercise_id + ' '+
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
 * Function for checking if new exercises need to be generated on a day
 */
function checkForExerciseGeneration(req, res) {
    var user_id = req.decoded.user_id;
    var current_date = utils.getCurrentDate();
    var query = "";

    console.log();
    console.log();
    console.log("**************************** CHECK FOR GENERATION **********************************");
    console.log("** user_id: " + user_id);
    console.log("** current_date: " + current_date);

    //TODO user specifiek
    // check of er nog geen exercises zijn gegenereerd voor deze dag
    query = 'SELECT treatment_exercise_id FROM treatment_exercise AS te ' +
        'INNER JOIN treatment AS t ON t.treatment_id = te.treatment_id ' +
        'WHERE todo_date = ' + '"' + current_date + '" ' +
        'AND t.user_id = ' + user_id;


    connection.query(query, function (err, result) {
        if (err) {
            console.log("Error: " + err);
        }
        console.log("TESTT: "+result);
        console.log("TESTT2: "+result.length);
        // Check of er meerdere rows zijn gevonden met als datum vandaag
        if(result.length > 0){
            // Er hoeft niks te worden gegenereerd!
            console.log("Exercises are already generated for today!");
            if(getExercise) {
                getExercises(req, res);
            }

        } else {
            // Genereer oefeningen!
            console.log("** Exercises not earlier generated for today, so allowed to start generation!");
            console.log();
            console.log("----- start exercise generation!");
            generateExercises(user_id, current_date, req, res);
        }
    });
}

/**
 * Function for generating exercises for a treatment of a user on a current day.
 * @param user_id
 * @param current_date
 */
function generateExercises(user_id, current_date, req, res) {
    var exercise_id;

    console.log("user_id: " + user_id);
    console.log("current_date: " + current_date);

    // Onderstaande query selecteert alle oefeningen die bij de klachten van een gebruiker horen
    var query = 'SELECT exercise_id FROM complaint_exercise AS ce ' +
        'INNER JOIN user_complaint AS uc ON uc.complaint_id = ce.complaint_id ' +
        'WHERE uc.user_id = ' + user_id + ' ' +
        'LIMIT 4';


    connection.query(query, function (err, result) {
        if (err) {
            console.log("Error: " + err);
        }

        (function () {
            // var hour = -1;
            var newTime = new Date();

            for (i = 0; i < result.length; i++) {
                (function () {
                    var printTime = new Date();
                    var hh;

                    console.log();
                    console.log("--------------------------------------------------");
                    console.log("-- CURRENT TIME: " + newTime.getHours() + ":" + newTime.getMinutes());

                    // Check: time may not be greater than or equal to 16:30
                    if((newTime.getHours() >= 24 && newTime.getMinutes() >= 30)){
                        console.log("-- Too late to generate :D");
                        console.log("--------------------------------------------------")
                    } else {
                        console.log("-- It's not 16:30 yet!");
                        // console.log("-- Current time: " + newTime.getHours() + ":" + newTime.getMinutes());
                        var mm = newTime.getMinutes(); // haal het aantal minuten op

                        // Als het de eerste keer is en de tijd groter/gelijk dan 30
                        // if (i === 0 && mm >= 30) { // Als het aantal minuten groter of gelijk is aan 30, moeten we het uur de eerste keer 1 ophogen
                        //     console.log("i: " + i);
                        //     console.log(">=30");
                        //     console.log("EERST: " + newTime.getHours());
                        //     hh = newTime.getHours() + 1;
                        //     newTime.setHours(hh);
                        //     console.log("ER NA: " + newTime.getHours());
                        //     console.log();
                        // } else

                        // When it's the first time and the amount of minutes < 30, we only need to set the current hour
                        if(i === 0 && mm < 30){
                            // console.log("i: " + i);
                            // console.log("<30");
                            // console.log("EERST: " + newTime.getHours());
                            hh = newTime.getHours();
                            newTime.setHours(hh);
                            // console.log("ER NA: " + newTime.getHours());
                            // console.log();
                            // When it's the first time and the amount of minutes >= 30, we want to add 1 to the current hour
                            // When it's not the first time, we still want to add 1 hour to the current time for every new exercise
                        } else {
                            // console.log("EERST: " + newTime.getHours());
                            hh = newTime.getHours() + 1;
                            newTime.setHours(hh);
                            // console.log("ER NA: " + newTime.getHours());
                            // console.log();
                        }
                        mm = 30; // set het aantal minuten nu op 30, omdat we om het halfuur een oefening willen
                        newTime.setMinutes(mm);
                        var ss = '00';

                        printTime = hh + ":" + mm + ":" + ss;
                        console.log();
                        console.log("-->\tINSERT GENERATED EXERCISE TIME: " + printTime);

                        exercise_id = result[i].exercise_id;
                        console.log("-->\tINSERT exercise " + (i + 1) + " with exercise_id: " + exercise_id);
                        console.log("--------------------------------------------------");

                        // Onderstaande query voegt aan de koppeltabel treatment_exercise het betreffende behandelplan toe van de gebruiker,
                        // een random gegenereerde oefening, en de to do datum & to do tijd vd oefening
                        query = 'INSERT INTO treatment_exercise (treatment_id, exercise_id, todo_date, todo_time) ' +
                            'VALUES ((SELECT te.treatment_id FROM treatment AS te ' +
                            'WHERE "' + current_date + '" between te.start_date AND te.end_date ' +
                            'AND te.user_id = ' + user_id + '), ' + exercise_id + ', "' + utils.getCurrentDate() + '", "' + printTime + '")';

                        connection.query(query, function (err, result) {
                            if (err) {
                                console.log("Error: " + err);
                            }
                        });
                    }
                })();
            }
        })();
        if(getExercise) {
            getExercises(req, res);
        }
        console.log("----- end posting exercises successfully!");
        console.log();
    });
}