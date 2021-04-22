const { promisify } = require('util');
const User = require('./../models/userModel');
const asyncWrapper = require('../utils/asyncWrapper');
const APIQueryFeatures = require('../utils/apiQueryFeatures');

const getProfile = async (userId) => await User.findById(userId)

//user already verified by protect middleware
module.exports.getMyProfile = asyncWrapper(async (req, res) => {
    const userProfile = await promisify(getProfile)(req.user._id);

    if (!userProfile) {
        res.status(404).json({ status: "Failed", message: "User not found!" })
    }

    res.status(200).json({ status: "Success", body: { user: userProfile } })

});

module.exports.updateMyProfile = asyncWrapper(async (req, res) => {
    if (req.body.password || req.body.confirmPassword) {
        return next("Cant use this route to update password");
    }

    const filteredBody = { ...req.body };
    delete filteredBody.username;
    delete filteredBody.email;

    const updateUser = await User.findByIdAndUpdate(req.user._id, filteredBody, { runValidators: true, new: true });

    res.status(200).json({ status: "Success", body: { user: updateUser } });
});

module.exports.deleteMyProfile = asyncWrapper(async (req, res) => {
    await User.findByIdAndDelete(req.user._id);

    res.status(204).json({ status: "Success" });

});

//admin routes used by support teams
module.exports.getUser = asyncWrapper(async (req, res) => {
    const userProfile = await promisify(getProfile)(req.params.id);

    if (!userProfile) {
        res.status(404).json({ status: "Failed", message: "User not found!" })
    }

    res.status(200).json({ status: "Success", body: { user: userProfile } })
});

module.exports.updateUser = asyncWrapper(async (req, res) => {
    const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });

    if (!updateUser) {
        return res.status(404).json({ status: "Failure", message: "User does not exist!" });
    }

    res.status(200).json({ status: "Success", body: { user: updateUser } });
});

module.exports.deleteUser = asyncWrapper(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: "Success" });
});

module.exports.getAllUsers = asyncWrapper(async (req, res) => {
    const queryFeature = new APIQueryFeatures(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const doc = await queryFeature.query;

    res.status(200).json({
        status: "Success",
        result: doc.length,
        data: {
            data: doc
        }
    });
});