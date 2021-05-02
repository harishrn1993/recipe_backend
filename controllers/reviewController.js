const Review = require('./../models/reviewModel');
const asyncWrapper = require('./../utils/asyncWrapper');

module.exports.createReview = asyncWrapper(async (req, res) => {
    req.body.recipeId = req.params.recipeId;
    req.body.userId = req.params.userId;

    const review = await Review.create(req.body);

    res.status(200).json({
        status: "Success", data: {
            data: review
        }
    })
});

module.exports.get = asyncWrapper(async (req, res) => {
    const review = await Review.findOne({
        userId: req.params.userId,
        recipeId: req.params.recipeId
    });

    if (!review) {
        res.status(404).json({
            status: "Failure",
            message: "Requested document is not found"
        });
    }

    res.status(200).json({
        status: "Success", data: {
            data: review
        }
    });
});

module.exports.update = asyncWrapper(async (req, res) => {
    req.body.recipeId = req.params.recipeId;
    req.body.userId = req.params.userId;

    const review = await Review.findOneAndUpdate({
        userId: req.params.userId,
        recipeId: req.params.recipeId
    }, req.body, {
        new: true,
        runValidators: true
    });

    if (!review) {
        res.status(404).json({
            status: "Failure",
            message: "Requested document is not found"
        });
    }

    res.status(200).json({
        status: "Success", data: {
            data: review
        }
    });
});

module.exports.delete = asyncWrapper(async (req, res) => {
    const review = await Review.findOneAndDelete({
        userId: req.params.userId,
        recipeId: req.params.recipeId
    });

    if (!review) {
        res.status(404).json({ status: "Failure", message: "Requested data not found" });
    }

    res.status(204).json({
        status: 'success',
        data: {
            data: review
        }
    });
});

module.exports.getCommentById = asyncWrapper(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404).json({
            status: "Failure",
            message: "Requested document is not found"
        });
    }

    res.status(200).json({
        status: "Success", data: {
            data: review
        }
    });
});