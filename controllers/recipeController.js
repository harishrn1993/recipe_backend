const { promisify } = require('util');
const User = require('./../models/userModel');
const Recipe = require("./../models/recipeModel");
const asyncWrapper = require("./../utils/asyncWrapper");
const ApiQueryFeatures = require("./../utils/apiQueryFeatures");


module.exports.getRecommeded = asyncWrapper(async (req, res, next) => {
    //Gets top 10 in each meal category
    let data = {};

    data = {}
    data.breakfast = await Recipe.find({ mealType: 'breakfast' }).limit(20).exec();
    data.lunch = await Recipe.find({ mealType: 'lunch' }).limit(20).exec();
    data.dinner = await Recipe.find({ mealType: 'dinner' }).limit(20).exec();
    data.snacks = await Recipe.find({ mealType: 'snacks' }).limit(20).exec();

    res.status(200).json({
        status: "Success",
        data
    })
});

module.exports.getAll = asyncWrapper(async (req, res) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new ApiQueryFeatures(Recipe.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    // const doc = await features.query.explain();
    const recipes = await features.query;

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: recipes.length,
        data: recipes
    });
});

module.exports.createRecipe = asyncWrapper(async (req, res) => {
    req.body.author = req.user.id;
    const recipe = await Recipe.create(req.body);
    if (recipe) {
        req.user.cookedRecipes.push(recipe._id)
        await req.user.save({ validateBeforeSave: false })
    }
    res.status(200).json({
        status: "Success", data: {
            data: recipe
        }
    });
});

module.exports.getRecipeById = asyncWrapper(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404).json({ status: "Failure", message: "Requested data not found" });
    }

    res.status(200).json({
        status: 'success',
        data: recipe
    });

});

module.exports.updateRecipeById = asyncWrapper(async (req, res) => {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!recipe) {
        res.status(404).json({ status: "Failure", message: "Requested data not found" });
    }

    if (req.user.userType !== 'admin' || req.user.id !== recipe.author) {
        res.status(401).json({ status: "Failure", message: "You are not authorized to update" });
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: recipe
        }
    });
});

module.exports.deleteRecipeById = asyncWrapper(async (req, res) => {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
        res.status(404).json({ status: "Failure", message: "Requested data not found" });
    }

    if (req.user.userType !== 'admin' || req.user.id !== recipe.author) {
        res.status(401).json({ status: "Failure", message: "You are not authorized to update" });
    }

    res.status(204).json({
        status: 'success',
        data: {
            data: recipe
        }
    });
});