const Track = require('../models/Track');
const catchAsync = require('../utils/catchAsync');
const aggrController = require('./aggrController');
const handlerFactory = require('./handlerFactory');


exports.getAllTracks = handlerFactory.getAll(Track);
exports.postTrack = handlerFactory.createOne(Track);
exports.getTrack = handlerFactory.getOne(Track);
exports.updateTrack = handlerFactory.updateOne(Track);
exports.deleteTrack = handlerFactory.deleteOne(Track);

exports.getKKAllTimeHits = catchAsync(async (req, res, next) => {
    const tracks = await aggrController.aggrKKSongs();
    
    res.status(200).json({
        status: 'success',
        results: tracks.length,
        data: {
            tracks
        }
    })
})