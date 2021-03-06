const randomstring = require("randomstring");
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require("../models/userModel.js");
const asyncWrapper = require("../utils/asyncWrapper");
const { sendSignUpEmail, forgotPasswordEmail } = require("./../utils/emailMailer");


const createToken = (id, expiresIn) => jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn
});

const createTokenAndSend = (user, res) => {
    const token = createToken(user._id, process.env.JWT_EXPIRES_IN);

    user.password = undefined;

    res.status(200).json({
        status: "Success",
        data: { user, token }
    });
}

const createLink = (user, routeName) => {

    const token = createToken(user._id, process.env.JWT_EXPIRES_IN_ONE_DAY);
    //TODO link should be off React App
    return `http://localhost:5001/api/v1/users/${routeName}/${token}`;

}

module.exports.updatePassword = asyncWrapper(async (req, res) => {
    if (!req.body.password || !req.body.confirmPassword) {
        res.status(400).json({ status: "Failure", message: "Missing values" });
    }


    req.user.password = req.body.password;
    req.user.confirmPassword = req.body.confirmPassword;
    await req.user.save();

    createTokenAndSend(req.user, res);
})

module.exports.signup = asyncWrapper(async (req, res) => {
    const { username, password, confirmPassword, email, userType } = req.body;
    if (!(username && password && confirmPassword && email)) {
        return res.status(400).json({
            status: "failed",
            message: "Bad request"
        })
    }
    const user = new User({
        username,
        password,
        confirmPassword,
        email,
        userType
    });
    await user.save();

    //create link
    const link = createLink(user, "verifyUser");
    await sendSignUpEmail(user.email, link);
    createTokenAndSend(user, res);
});

module.exports.login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
        return res.status(400).json({
            status: "Failure",
            message: "Password or Email missing!"
        });
    }
    //get user  && check password is same 

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').exec();

    if (!user || !await user.checkPasswords(password)) {
        return res.status(401).json({
            status: "Failure",
            message: "Password or Email did not match!"
        });
    };

    //then gen token and send it 
    return createTokenAndSend(user, res);
});

module.exports.forgotPassword = asyncWrapper(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ status: "Failed", message: "Please enter email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(400).json({ status: "Failed", message: "There is no user with this email." });
    }

    const randomString = randomstring.generate(8);
    user.password = randomString;
    await user.save({ validateBeforeSave: false });

    const link = createLink(user, "forgotPassword");
    forgotPasswordEmail(email, randomString, link);

    res.status(200).json({
        status: "Success"
    });
});

module.exports.resendVerification = asyncWrapper(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ status: "Failed", message: "User does not exist" });
    }

    const link = createLink(req.user, "verifyUser");
    await sendSignUpEmail(req.user.email, link);

    res.status(200).json({
        status: "Success"
    });
})

module.exports.verifyUser = asyncWrapper(async (req, res) => {
    let userId = req.params.id;
    const decodedJWT = await promisify(jwt.verify)(userId, process.env.JWT_SECRET_KEY);

    if (!decodedJWT.iat > Date.now()) {
        return res.status(402).json({ status: "Failed", message: "Should have verified within 24hrs." })
    }

    userId = decodedJWT.id;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ status: "Failed", message: "User does not exist!" })
    }
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).send("<h1>Verification Successfull</h1>");
});

module.exports.resetPassword = (req, res) => {
    //send verification device  and reset password
}

module.exports.protect = asyncWrapper(async (req, res, next) => {
    //get header token and verify it
    if (!(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))) {
        return next('No header');
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
        return next('Please Login');
    }

    const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

    //check user ffrom token exist
    const user = await User.findById(decodedJWT.id);

    if (!user) {
        return next("User no longer exist.");
    }

    //check if password is still same
    if (!user.passwordChangedAt && user.passwordChangedAt > decodedJWT.iat) {
        return next("Token expired, please re-login");
    }
    //grant permission
    req.user = user;
    return next();

});

module.exports.restrictTo = (...roles) => (req, _res, next) => {
    if (!roles.includes(req.user.userType)) {
        next("You are not authorized to use this route");
    };
    next();
}

module.exports.updateMyPassword = asyncWrapper(async (req, res) => {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        res.status(400).json({ status: "Failed", message: "Password cannot be empty" });
    }
    const { user } = req;

    user.password = password;
    user.confirmPassword = confirmPassword;
    await user.save();

    createTokenAndSend(req.user, res)
});