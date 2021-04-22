const { promisify } = require('util');
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
        body: {
            data
        }
    })
});

module.exports.getAll = asyncWrapper(async (req, res, next) => {
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
        data: {
            data: recipes
        }
    });
});

module.exports.createRecipe = asyncWrapper(async (req, res) => {
    const recipe = await Recipe.create(req.body);
    res.status(200).json({
        status: "Success", data: {
            data: recipe
        }
    })
});

module.exports.getRecipeById = asyncWrapper(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404).json({ status: "Failure", message: "Requested data not found" });
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: recipe
        }
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

    res.status(204).json({
        status: 'success',
        data: {
            data: recipe
        }
    });
});