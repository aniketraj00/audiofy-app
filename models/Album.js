const mongoose = require('mongoose');


const AlbumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An album must have a name!'] 
    },
    year: {
        type: String,
        required: [true, 'An album must have a release year!']
    },
    genre: {
        type: [String],
        required: [true, 'An album must have a genre!']
    },
    contributingArtists: { 
        type: [String],
        required: [true, 'An album must have atleast one contributing artist!']
    },
    cover: {
        type: String,
        default: '/img/albumDefault.png'
    },
    tracks: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Track'
        }
    ]
});


AlbumSchema.index({ name: 1 });


AlbumSchema.pre(/^findOne/, function(next) {
    this.populate({
        path: 'tracks',
        select: '-__v'
    })
    next();
});


module.exports = mongoose.model('Album', AlbumSchema);