const express = require('express');
const authController = require("./../controllers/authController");
const userController = require('./../controllers/userController');

const router = express.Router();

//User routes without authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:id', authController.resetPassword);
router.get('/verifyUser/:id', authController.verifyUser);

//User routes with authentication for both user and admin
router.use(authController.protect);


router.post('/resendVerification/:id', authController.resendVerification);

router.patch('/updatePassword', userController.updatePassword);
router.get('/profile', userController.getProfile);
router.patch('/updateProfile', userController.updateProfile);
router.delete('/deleteProfile', userController.deleteProfile);

// //User routes with authentication for only admin
// router.use(authController.restrictTo('admin'));

// router.route('/').get(userController.getAllUsers).post(userController.createUser);

// router.use('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;

