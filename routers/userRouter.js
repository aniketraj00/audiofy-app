const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();


//Routers that dont require the user to be logged in before accessing the endpoint

//Signup Router(s)
router.post('/signup', authController.verifySignup);
router.post('/signup/:tempUserId/:verificationToken', authController.signup)

//Password Reset Router(s)
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:resetToken', authController.resetPassword);

//Login Router(s)
router.post('/login', authController.login);

//Logout Router(s)
router.get('/logout', authController.logout);


//Routers that need the user with a specific role like admin to be logged in
router.use(
    authController.checkAuthorization, 
    authController.restrictTo('admin')
);

router
    .route('/')
    .get(userController.getAllUser)
    .post(userController.createUser)   //Use /signup route to create new users.

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;