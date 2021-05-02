const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "title is missing"],
        max: 50,
        min: 3
    },
    mealType: {
        type: String,
        lowercase: true,
        enum: ["breakfast", "lunch", "dinner", "snacks"],
        required: [true, "mealType is missing"]
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "author is missing"]
    },
    ingredients: [
        {
            name: {
                type: String,
                required: [true, "ingredients is missing"]
            },
            quantity: {
                type: String,
                required: [true, " is missing"]
            }
        }
    ],
    steps: [
        {
            stepNumber: {
                type: Number,
                required: [true, "stepNumber is missing"]
            },
            instruction: {
                type: String,
                required: [true, "instruction is missing"]
            },
        }
    ],
    description: {
        type: String,
        required: [true, "description is missing"]
    },
    cookTimeInMinutes: {
        type: Number,
        required: [true, "cookTime is missing"]
    },
    difficultyLevel: {
        type: String,
        enum: ["hard", "easy", "medium"],
        lowercase: true,
        required: [true, "difficultyLevel is missing"]
    },
    imagePath: {
        type: String
    },
    servers: {
        type: Number,
        required: [true, "servers is missing"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

recipeSchema.pre(/^find/, function (next) {
    this.populate({
        path: "reviews",
        select: "-__v"
    });
    next();
});

recipeSchema.index({ author: 1, title: 1 }, { unique: true });

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
