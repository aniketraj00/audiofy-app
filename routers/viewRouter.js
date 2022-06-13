const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(authController.isLoggedIn);

//Authenticated user view routes
router.get('/', viewController.redirectIfNotLoggedIn('/login'), viewController.getIndex)


//Admin view routes
router.get(
    '/admin', 
    viewController.redirectIfNotLoggedIn('/login'), 
    viewController.protectAdminResource(),
    viewController.getAdminDashboard    
);

router.get(
    '/admin/manageAlbum',
    viewController.redirectIfNotLoggedIn('/login'),
    viewController.protectAdminResource(),
    viewController.manageAlbum
);

router.get(
    '/admin/uploadAlbum',
    viewController.redirectIfNotLoggedIn('/login'),
    viewController.protectAdminResource(),
    viewController.uploadAlbum
);

router.get(
    '/admin/manageUser',
    viewController.redirectIfNotLoggedIn('/login'),
    viewController.protectAdminResource(),
    viewController.manageUser
);

router.post(
    '/admin/auth/sign-s3',
    viewController.redirectIfNotLoggedIn('/login'),
    viewController.protectAdminResource(),
    adminController.signS3UploadRequest()
);



router.use(viewController.redirectIfLoggedIn('/'));

//Public accessible view routes
router.get('/login', viewController.getLogin);
router.get('/signup', viewController.getSignupVerify);
router.get('/signup/:tempUserId/:verificationToken', viewController.getSignup);
router.get('/resetPassword', viewController.getResetPasswordVerify);
router.get('/resetPassword/:resetToken', viewController.getPasswordReset);

module.exports = router;