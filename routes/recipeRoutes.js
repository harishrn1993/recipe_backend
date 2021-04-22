const express = require('express');
const recipeController = require('./../controllers/recipeController');
const authController = require('./../controllers/authController');

const router = express.Router();

//Routes which doesnt need auth
router.get('/getRecommeded', recipeController.getRecommeded);

router.get('/getAll', recipeController.getAll);
router.get('/:id', recipeController.getRecipeById);

router.use(authController.protect);
router.post('/', recipeController.createRecipe);

router.use(authController.restrictTo('admin', 'user'));
router.route("/:id")
    .patch(recipeController.updateRecipeById)
    .delete(recipeController.deleteRecipeById);

module.exports = router;