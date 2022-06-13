const catchAsync = require("../utils/catchAsync");
const Album = require('../models/Album');
const handlerFactory = require('./handlerFactory');
const aggrController = require('./aggrController');

exports.getAllAlbums = handlerFactory.getAll(Album);
exports.getAlbum = handlerFactory.getOne(Album);
exports.createAlbum = handlerFactory.createOne(Album);
exports.updateAlbum = handlerFactory.updateOne(Album);
exports.deleteAlbum = handlerFactory.deleteOne(Album);

exports.getLatestAlbums = catchAsync(async (req, res, next) => {
    
    const albums = await aggrController.aggrLatestAlbums();
    res.status(200).json({
        status: 'success',
        results: albums.length,
        data: {
            albums
        }
    });
});



