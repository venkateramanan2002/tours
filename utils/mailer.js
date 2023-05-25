const nodemailer = require('nodemailer');


const sendEmail =  options =>
{

    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
    user: 'mvrhsr@gmail.com',
    pass: 'qefsdnnvxnkfeeyk'
}
});

// Define email options
const mailOptions = {
    from: 'ABC College',
    to: options.email,
    subject: options.email,
    text: options.message
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error occurred:', error.message);
    } else {
      console.log('Email sent successfully!');
      console.log('Message ID:', info.messageId);
    }
});
}

module.exports = sendEmail;