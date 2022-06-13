const slugify = require('slugify');
const aws = require('aws-sdk');
const AppError = require('../utils/appError');

exports.signS3UploadRequest = () => {
    return (req, res, next) => {
        const fileName = slugify(req.body.fileName);
        const fileType = req.body.fileType;
        const s3Params = {
            Bucket: process.env.AWS_BUCKET,
            Key: fileName,
            ContentType: fileType,
            Expires: 60,
            ACL: 'public-read'
        }

        aws.config.region = process.env.AWS_BUCKET_REGION;
        const S3 = new aws.S3();
        S3.getSignedUrl('putObject', s3Params, (err, signedUrl) => {
            
            setTimeout(() => {
                
                if(err) {
                    return next(new AppError(500, err.message));
                }
                
                const data = {
                    fileUrl: `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${fileName}`,
                    signedUrl
                }
                res.status(200).json({
                    status: 'success',
                    signedResponse: JSON.stringify(data)
                });

            }, 2000);

        });        
    }
}