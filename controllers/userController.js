const User = require('./../models/userModel');
const asyncWrapper = require('../utils/asyncWrapper');
const APIQueryFeatures = require('../utils/apiQueryFeatures');
const Recipe = require('../models/recipeModel');

//user already verified by protect middleware
module.exports.getMyProfile = asyncWrapper(async (req, res) => {
    const userProfile = await User.findById(req.user.id, '-password -__v ')

    if (!userProfile) {
        res.status(404).json({ status: "Failed", message: "User not found!" })
    }

    res.status(200).json({ status: "Success", body: { user: userProfile } })

});

module.exports.updateMyProfile = asyncWrapper(async (req, res, next) => {
    if (req.body.password || req.body.confirmPassword) {
        return next("Cant use this route to update password");
    }

    if (req.body.email || req.body.username) {
        return next("Cant change email or username");
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
    const userProfile = await User.findById(req.params.id);

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

module.exports.addFavorite = asyncWrapper(async (req, res) => {
    //recipe must exist to add 
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!recipe) {
        return res.status(400).json({
            status: "Failure",
            message: "Requested data not valid"
        });
    };
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { favoriteRecipes: recipe._id } })

    res.status(200).json({
        status: "Success", data: {
            data: user
        }
    });
});