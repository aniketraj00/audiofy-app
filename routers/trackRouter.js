const express = require('express');
const trackController = require('../controllers/trackController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.checkAuthorization);

router.get('/kkAllTimeHits', trackController.getKKAllTimeHits);

router
    .route('/')
    .get(trackController.getAllTracks)
    .post(authController.restrictTo('admin'), trackController.postTrack);

router
    .route('/:id')
    .get(trackController.getTrack)
    .patch(authController.restrictTo('admin'), trackController.updateTrack)
    .delete(authController.restrictTo('admin'), trackController.deleteTrack);


module.exports = router;