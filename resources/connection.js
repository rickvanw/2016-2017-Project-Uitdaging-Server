var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '178.21.112.250',
    user: 'uitdaging',
    password: 'ehi2va15',
    database: 'customer'
});

connection.connect();

module.exports = connection;