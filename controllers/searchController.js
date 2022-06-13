const catchAsync = require('../utils/catchAsync');
const QueryFeatures = require('../utils/queryFeatures');
const Album = require('../models/Album');

exports.getAlbumSearchResult = catchAsync(async (req, res, next) => {

    if(req.query.name || req.query.artist || req.query.year) {
    
        //Build the query object
        let query = new QueryFeatures(req.query, Album.find());

        //Query by album name (regex pattern)
        if(req.query.name) {
            let re = new RegExp(`${req.query.name}`, 'i');
            query.mongoQueryObj = query.mongoQueryObj.find({ name: { $regex: re } });
        }

        //Query by year
        if(req.query.year) {
            query.mongoQueryObj = query.mongoQueryObj.find({ year: req.query.year });
        }

        //Query by artist involved
        if(req.query.artist) {
            let re = new RegExp(`${req.query.artist}`, 'i');;
            query.mongoQueryObj = query.mongoQueryObj.find({ contributingArtists: { $in: [re] } });
        }
            

        //Get the total results count
        const resultCount = (await query.mongoQueryObj).length;

        //Paginate the results
        query = query.paginate();

        //Execute the query.
        const results = await query.mongoQueryObj;

        //Send the response back as JSON
        return res.status(200).json({
            status: 'success',
            total: resultCount,
            results: results.length,
            data: {
                albums: results
            }
        });
      
            
    }
    res.status(400).json({
       status: 'fail',
       message: 'Invalid search request!' 
    });
});