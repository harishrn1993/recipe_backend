const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const asyncWrapper = require('../utils/asyncWrapper');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is missing"]
    },
    password: {
        type: String,
        required: [true, "Password is missing"],
        min: 8
    },
    email: {
        type: String,
        required: [true, "Email is missing"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    confirmPassword: {
        type: String,
        required: [true, "Password is missing"],
        min: 8,
        validate: {
            validator: function (value) {
                return this.password === value
            },
            message: "Password is incorrect"
        }
    },
    userType: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'],
        lowercase: true
    },
    favoriteRecipes: {
        type: [mongoose.Types.ObjectId]
    },
    cookedRecipes: {
        type: [mongoose.Types.ObjectId]
    },
    createdAt: { type: Date, default: Date.now },
    isVerified: {
        type: Boolean,
        default: false
    },
    dp: String
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

//instance methods
userSchema.methods.checkPasswords = async function (givenPassword) {
    return await bcrypt.compare(givenPassword, this.password);
}

// eslint-disable-next-line func-names
userSchema.pre('save', async function (next) {
    try {
        if (this.isNew || this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 12);
            this.confirmPassword = undefined;
            next();
        }
    }
    catch (err) {
        next(err)
    }
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// asyncWrapper(async (givenPassword, userPassword) => await bcrypt.compare(givenPassword, userPassword));

const User = mongoose.model('User', userSchema);

module.exports = User;

