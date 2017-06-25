var nodemailer = require('nodemailer');

var transporter;

var email = function () {
    // Transporter object using the gmail service
    transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25,
        auth: {
            user: 'komnuinbeweging@gmail.com',
            pass: 'kominbeweging'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

email.prototype.sendEmail = function (mailOptions) {
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            //console.log(error);
            return false;
        }
        return true;
    });
};

module.exports = new email();





