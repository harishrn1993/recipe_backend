const express = require("express");
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router();


//get by review id
router.get('/:id', reviewController.getCommentById);
// router.get("/:reviewId");

//auth routes from creating and deleteing and updating
router.use(authController.protect);
router.route('/:userId/:recipeId').post(reviewController.createReview)
    .get(reviewController.get)
    .patch(reviewController.update)
    .delete(reviewController.delete);

module.exports = router;