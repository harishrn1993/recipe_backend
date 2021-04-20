
const nodemailer = require("nodemailer");
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: process.env.SMTP_USERNAME, // generated ethereal user
//         pass: process.env.SMTP_PASSWORD, // generated ethereal password
//     },
// });

exports.sendSignUpEmail = (email, verificationLink) => new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USERNAME, // generated ethereal user
            pass: process.env.SMTP_PASSWORD, // generated ethereal password
        },
    });

    const info = transporter.sendMail({
        from: '"RecipeApp" <harish.rn1993@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Verify Email Address", // Subject line
        text: "Hello world", // plain text body
        html: `<b>Thanks for registering, please click the below link to activate your account?
            
            <a href=${verificationLink}>Verify User</a> `
        // html body
    }, (err) => {
        if (err) {
            reject(err)
        }
        console.log("messageSent")
        resolve();
    });
});

exports.forgotPasswordEmail = (email, otp, link) => new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USERNAME, // generated ethereal user
            pass: process.env.SMTP_PASSWORD, // generated ethereal password
        },
    });

    const info = transporter.sendMail({
        from: '"RecipeApp" <harish.rn1993@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Forgot Password", // Subject line
        text: "Hello world", // plain text body
        html: `<b>Use this OTP (${otp}) to login into your account and update your password manually.
            
            <a href=${link}>Login</a> `
        // html body
    }, (err) => {
        if (err) {
            reject(err)
        }
        console.log("messageSent")
        resolve();
    });
});