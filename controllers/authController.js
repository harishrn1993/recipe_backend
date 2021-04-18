const jwt = require('jsonwebtoken');
const User = require("../models/userModel.js");
const asyncWrapper = require("../utils/asyncWrapper");


const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
});

const createTokenAndSend = (user, res) => {
    const token = createToken(user._id);

    user.password = undefined;

    res.status(200).json({
        status: "Success",
        data: user,
        token
    }
    );
}

module.exports.signup = asyncWrapper(async (req, res, next) => {
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

module.exports.forgotPassword = (req, res) => {
    //send otp messages
}

module.exports.resetPassword = (req, res) => {
    //send verification device  and reset password
}

module.exports.protect = async (req, res, next) => {
    //get header token and verify it
    if (!(req.headers.authorization && req.headers.authorization.startsWith('bearer'))) {
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

}

module.exports.restrictTo = (...roles) => (req, _res, next) => {
    if (!roles.includes(req.user.roles)) {
        next("You are not authorized to use this route");
    };
    next();
}

