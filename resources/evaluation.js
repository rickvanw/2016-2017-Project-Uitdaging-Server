/**
 * All API calls for evaluation.
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

// router.get('', function(req, res){
//     // TODO token
//     var user_id = req.body.userid;
//
//     // TODO token check
//     var query = 'SELECT * FROM evaluation WHERE user_id = ' + user_id;
//
//     connection.query(query, function (err, evaluation) {
//         if (err) {
//             console.log(err.message);
//             // utils.error(409, 'Already exists', res);
//             res.status(404).send("Cannot find evaluation");
//             return;
//         }
//
//         res.status(200).json(evaluation);
//     })
// });

router.get('evaluations', function (req, res) {
    console.log("test");
    var user_id = req.decoded.user_id;

    var query = 'SELECT e.question, te.answer FROM evaluation AS e ' +
        'INNER JOIN treatment_evaluation AS te ON te.evaluation_id = e.evaluation_id ' +
        'INNER JOIN user_treatment AS ut ON ut.treatment_id = te.treatment_id ' +
        'WHERE ut.user_id = ' + user_id;

    connection.query(query, function (err, evaluation) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot find evaluation");
            return;
        }

        console.log(evaluation);

        res.status(200).json(evaluation);
    });
});

router.post('/add', function (req, res) {
    var user_id = req.decoded.user_id;
    var questions = JSON.parse(req.body.questions);
    var answers = JSON.parse(req.body.answers);
    var evaluation_count = 0;

    console.log();
    console.log();
    console.log("**************************** CHECK FOR POSTING EVALUATION **********************************");
    console.log("** user_id: " + user_id);

    var query = 'SELECT evaluation_id FROM treatment_evaluation AS te ' +
        'INNER JOIN treatment AS t ON t.treatment_id = te.treatment_id ' +
        'WHERE t.user_id = ' + user_id;

    connection.query(query, function (err, result) {
        if (err) {
            console.log("Error: " + err);
        }

        var evaluation_id;

        for (i = 0; i < result.length; i++) {
            evaluation_id = result[i].evaluation_id;
        }
        console.log("** evaluation_id: " + evaluation_id);

        if (evaluation_id !== undefined) {
            console.log("Answers for evaluation earlier defined for user with id " + user_id);
            res.status(406).send("Evaluation already posted!");
        } else {
            console.log("** Answers for evaluation not earlier defined, so allowed to post evaluation!");
            console.log();
            console.log("----- start posting evaluation");
            (function () {
                for (i = 0; i < answers.length; i++) {
                    console.log("Question: " + questions[i]);
                    console.log("Answers: " + answers[i]);

                    var questionIndex = questions.indexOf(questions[i]) + 1;
                    console.log("Questionindex: " + questionIndex);
                    var insertAnswers = [];
                    var types = [];

                    if (answers[i].radio != undefined) {
                        console.log("RADIO: " + answers[i].radio);
                        insertAnswers.push(answers[i].radio);
                        types.push("radio");
                    }
                    if (answers[i].checkbox != undefined) {
                        var checkboxes = answers[i].checkbox;
                        console.log("CHECKBOX[]: " + checkboxes);
                        for (j = 0; j < checkboxes.length; j++) {
                            insertAnswers.push(checkboxes[j]);
                            types.push("checkbox");
                        }
                    }
                    if (answers[i].selected != undefined) {
                        console.log("SELECT: " + answers[i].selected);
                        insertAnswers.push(answers[i].selected);
                        types.push("select");
                    }

                    console.log("insertAnswers.length: " + insertAnswers.length);

                    (function () {
                        for (k = 0; k < insertAnswers.length; k++) {
                            console.log();
                            console.log("Insert question: " + questionIndex);
                            console.log("Insert answer: " + insertAnswers[k]);
                            console.log();
                            var query = 'INSERT INTO treatment_evaluation (evaluation_id, treatment_id, answer, type) ' +
                                'VALUES (' + questionIndex + ', (SELECT te.treatment_id FROM treatment AS te ' +
                                'WHERE te.user_id = ' + user_id + '), "' + insertAnswers[k] + '", "' + types[k] + '");';

                            connection.query(query, function (err, result) {
                                if (err) {
                                    console.log(err.message);
                                    // utils.error(409, 'Already exists', res);
                                    res.status(400).send("Foute aanvraag");
                                    return;
                                }

                                console.log("result: " + result);

                                res.status(201).send();
                            });
                        }
                    })();
                }
            })();
            console.log("----- end posting evaluation successfully!");
            console.log();
        }
    });
});