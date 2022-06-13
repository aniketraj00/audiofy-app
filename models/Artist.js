const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An artist must have a name!']
    },
    age: {
        type: Number,
        required: [true, 'Please fill in the artist\'s age!']
    },
    bio: String,
    


});

module.exports = mongoose.model('Artist', ArtistSchema);