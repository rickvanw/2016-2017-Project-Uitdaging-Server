var utils = function () {

};

module.exports = new utils();

/**
 * help method to standardise error messages
 * @param httpcode which httpcode to send
 * @param message error message
 * @param res used to respond (from express package)
 */
utils.prototype.error = function (httpcode, message, res) {
    res.status(httpcode);
    res.send(message);
};

utils.prototype.createQueryString = function (settings, query, query_args, append) {
    for (var item in settings) {
        if (settings.hasOwnProperty(item) && settings[item] && settings[item].length > 0) {
            query_args.push(settings[item]);
            query += item + " = ?,";
        }
    }

    return query.substr(0, query.length - 1) + " " + append;
};


/**
 * method to generate a random string, used for password generation
 * @param length length of the required string
 * @param chars string of characters you want to generate from, use null for a-z, A-Z, 0-9
 * @return {string}
 */
utils.prototype.randomString = function (length, chars) {
    if (chars === null) chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

/**
 * Function for returning the current date.
 * @returns {Date}
 */
utils.prototype.getCurrentDate = function(){
    var currentDate = new Date();
    var dd = currentDate.getDate();
    var mm = currentDate.getMonth() + 1; // January is zero, so + 1
    var yyyy = currentDate.getFullYear();

    // If the days / months are smaller than 10, we want to put a 0 before it. So for example 2017-09-09 instead of 2017-9-9
    if(dd < 10) {
        dd = '0' + dd
    }

    if(mm < 10) {
        mm = '0' + mm
    }

    currentDate = yyyy + '-' + mm + '-' + dd;
    return currentDate;
};

/**
 * Function for returning the current time.
 * @returns {Date}
 */
utils.prototype.getCurrentTime = function(){
    var currentTime = new Date();
    var hh = currentTime.getHours();
    var mm = currentTime.getMinutes();
    var ss = currentTime.getSeconds();

    currentTime = hh + ":" + mm + ":" + ss;

    return currentTime;
};

/**
 * Function for returning the current date with time.
 * @returns {Date}
 */
utils.prototype.getCurrentDateTime = function(){
    var currentDateTime = new Date();
    var currentDate = this.getCurrentDate();

    currentDateTime = currentDate + " "
    + currentDateTime.getHours() + ":"
    + currentDateTime.getMinutes() + ":"
    + currentDateTime.getSeconds();

    return currentDateTime;
};

/**
 * Function for returning the end date of a treatment. The end date is 6 weeks (42 days) after the start date.
 * @returns {Date}
 */
utils.prototype.getEndDate = function(){
    var endDate = new Date();
    addDays(endDate, 42);
    var dd = endDate.getDate(); // End date is 6 weeks after start date
    var mm = endDate.getMonth() + 1; // January is zero, so + 1
    var yyyy = endDate.getFullYear();

    // If the days / months are smaller than 10, we want to put a 0 before it. So for example 2017-09-09 instead of 2017-9-9
    if(dd < 10) {
        dd = '0' + dd
    }

    if(mm < 10) {
        mm = '0' + mm
    }

    endDate = yyyy + '-' + mm + '-' + dd;

    return endDate;
};

function addDays(date, numOfDays) {
    date.setTime(date.getTime() + (86400000 * numOfDays));
}