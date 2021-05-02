const mongoose = require("mongoose");
const asyncWrapper = require("../utils/asyncWrapper");
const Recipe = require("./recipeModel");

const reviewSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    recipeId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Recipe'
    },
    liked: Boolean,
    review: {
        type: String,
        max: 300
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverage = asyncWrapper(async function (recipeId) {
    const stats = await this.aggregate([
        {
            $match: { recipeId }
        },
        {
            $group: {
                _id: '$recipeId',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Recipe.findByIdAndUpdate(recipeId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Recipe.findByIdAndUpdate(recipeId, {
            ratingsQuantity: 0,
            ratingsAverage: 0
        });
    }
});

reviewSchema.post('save', function (next) {
    this.constructor.calculateAverage(this.recipeId);
    next();
});

reviewSchema.post(/^findOneAnd/, function () {
    this.constructor.calculateAverage(this.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

