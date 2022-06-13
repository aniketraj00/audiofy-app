const Album = require('../models/Album');
const Track = require('../models/Track');

exports.aggrLatestAlbums = limit => {
    
    const defaultPipeLines = [
        {
            $match: { 'year' : `${new Date(Date.now()).getFullYear()}` }
        },
        {
            $group: {
                _id: '$_id',
                name: { $first: '$name' },
                year: { $first: '$year' },
                cover: { $first: '$cover' },
            }
        }
    ]

    if(limit) defaultPipeLines.push({
        $limit: limit
    });

    return Album.aggregate(defaultPipeLines);
}

exports.aggrKKSongs = () => {

    const defaultPipeLines = [
        {
            $match: { artists: /k(?:\.*|\s*)k(?=\W+)/i  }
        },
        {
            $addFields: { 'year' : new Date(Date.now()).getFullYear()}
        }
    ]

    return Track.aggregate(defaultPipeLines);
}