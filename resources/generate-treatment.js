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

//var complaint_id = ;

var query = 'SELECT * FROM exercise WHERE exercise_id = ';

connection.query(query, function (err) {
    if(err) {
        console.log("Error: " + err);
    }



});