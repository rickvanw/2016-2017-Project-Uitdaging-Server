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

router.get('', function (req, res) {
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
    })
});

router.post('/add', function (req, res) {
    var user_id = req.decoded.user_id;
    var answers = JSON.parse(req.body.answers);
    var evaluation_id = 0;

    console.log("** user_id: " + user_id);
    console.log("** answers: " + answers);
    console.log("length: " + answers.length);

    console.log();
    console.log("----- start posting evaluation");
    (function () {
        for (i = 0; i < answers.length; i++) {
            var insertAnswers = [];

            if(answers[i].radio != undefined){
                console.log("RADIO: " + answers[i].radio);
                insertAnswers.push(answers[i].radio);
            }
            if(answers[i].checkbox != undefined){
                var checkboxes = answers[i].checkbox;
                console.log("checkboxes: " + checkboxes);
                for(j = 0; j < checkboxes.length; j++) {
                    console.log(checkboxes[j]);
                    insertAnswers.push(checkboxes[j]);
                }
            }

            console.log("insertAnswers.length: " + insertAnswers.length);

            (function () {
                for (k = 0; k < insertAnswers.length; k++) {
                    evaluation_id++;
                    var query = 'INSERT INTO treatment_evaluation (evaluation_id, treatment_id, answer) ' +
                        'VALUES (' + evaluation_id + ', (SELECT te.treatment_id FROM treatment AS te ' +
                        'WHERE te.user_id = ' + user_id + '), "' + insertAnswers[k] + '");';

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
});