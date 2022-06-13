const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A Track must have a title']
    },
    artists: {
        type: String,
        required: [true, 'A Track must have atleast one artist']
    },
    duration: {
        type: Number,
        required: [true, 'A Track must have a duration']
    },
    sourceFile: {
        type: String,
        required: [true, 'A Track must have a source file']
    },
});


module.exports = mongoose.model('Track', TrackSchema);