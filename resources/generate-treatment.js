/**
 * JS file for generating a treatment for a certain day with random exercises
 *
 * Created by maurice_2 on 18-5-2017.
 */

/**
 * 1. User geeft klachten aan
 * 2. Klachten met complaint_id opgeslagen voor user
 * 3. Bij elke klacht horen exercises
 * 4. Elke dag zal voor de gebruiker voor deze klachten random exercises worden gegenereerd
 *  - Get start_date en end_date
 *  - Check if current_date >= start_date && <= end_date
 *  - Haal de klachten van de gebruiker op
 *  - Kies voor elke klacht 1/meer random exercises
 *  - Zorg ervoor dat een dag van 8 uur gevuld wordt door om de uur een exercise te genereren
 * 5. De random exercises worden toegekend aan het behandelplan d.m.v. treatment_exercise
 * 6. Op de behandelplan pagina verschijnen de random exercises voor die dag
 */



var connection = require('./connection.js');

var user_id = 1;

//1. selecteer exercises
var query = 'SELECT exercise_id FROM complaint_exercise AS ce ' +
    'INNER JOIN user_complaint uc ON uc.complaint_id = ce.complaint_id' +
    'WHERE user_id = ' + user_id;

connection.query(query, function (err, result) {
    if (err) {
        console.log("Error: " + err);
    }

    console.log(result);

    // var exercise_id;
    //
    // //2. loop door exercises
    // for(exercise_id : query){
    //     var query = 'INSERT INTO treatment_exercise (treatment_id, exercise_id, todo_datetime)' +
    //         'VALUES ((SELECT treatment_id FROM user_treatment AS ut' +
    //         'WHERE ut.user_id = 1' +
    //         'INNER JOIN treatment AS t ON t.treatment_id = ut.treatment_id' +
    //         'WHERE currentdate >= start_date AND currentdate <= end_date), exercise_id, getCurrentDate))'
    //
    //
    // }

});