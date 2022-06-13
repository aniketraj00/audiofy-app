const catchAsync = require('../utils/catchAsync');
const QueryFeatures = require('../utils/queryFeatures');
const AppError = require('../utils/appError');

exports.getAll = Model => catchAsync(async (req, res, next) => {
    const query = new QueryFeatures(req.query, Model.find())
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const docs = await query.mongoQueryObj;
    const totalDocs = await Model.countDocuments();

    res.status(200).json({
        status: 'success',
        total: totalDocs,
        result: docs.length,
        data: {
            docs
        }
    });

});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if(popOptions) query.populate(popOptions);

    const doc = await query;
    if(!doc) {
        return next(new AppError(404, 'No document found with that ID'));
    }

    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    });
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            doc
        }
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!doc) {
        return next(new AppError(404, 'No document found with that ID'));
    }

    res.status(201).json({
        status: 'success',
        data: {
            doc
        }
    });
});

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc) {
        return next(new AppError(404, 'No document found with that ID'));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});