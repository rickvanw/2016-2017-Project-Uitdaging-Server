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
    res.type('json');
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