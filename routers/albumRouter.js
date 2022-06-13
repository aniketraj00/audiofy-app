const express = require('express');
const authController = require('../controllers/authController');
const albumController = require('../controllers/albumController');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.use(authController.checkAuthorization);

router.get('/search', searchController.getAlbumSearchResult);

router.get('/latest', albumController.getLatestAlbums);


router
    .route('/')
    .get(albumController.getAllAlbums)
    .post(authController.restrictTo('admin'), albumController.createAlbum)

router
    .route('/:id')
    .get(albumController.getAlbum)
    .patch(authController.restrictTo('admin'), albumController.updateAlbum)
    .delete(authController.restrictTo('admin'), albumController.deleteAlbum)

module.exports = router;