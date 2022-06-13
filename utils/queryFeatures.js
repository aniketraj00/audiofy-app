
module.exports = class QueryFeatures {
    /**
     * 
     * @param {any} userQueryObj The query parameters passed by the client while making an API Request.
     * @param {any} mongoQueryObj Query Object build using mongoose driver to be executed later for database queries.
     */
    constructor(userQueryObj, mongoQueryObj) {
        this.userQueryObj = userQueryObj;
        this.mongoQueryObj = mongoQueryObj;
    }

    filter() {

        let query = { ...this.userQueryObj };
        
        const escapedQueryKeys = ['sort', 'page', 'limit', 'fields'];
        escapedQueryKeys.forEach(el => delete query[el]);

        query = JSON.parse(JSON.stringify(query).replace(/\b(gt|gte|lt|lte)\b/gm, '$$$1'));
        this.mongoQueryObj = this.mongoQueryObj.find(query);

        return this;
    }

    sort() {

        if(this.userQueryObj.hasOwnProperty('sort')) {
            const sortBy = this.userQueryObj.sort.split(',').join(' ');
            this.mongoQueryObj = this.mongoQueryObj.sort(sortBy);
        } else {
            this.mongoQueryObj = this.mongoQueryObj.sort('-year name');
        }
        return this;
    }

    limitFields() {

        if(this.userQueryObj.hasOwnProperty('fields')) {
            const fields = this.userQueryObj.fields.split(',').join(' ');
            this.mongoQueryObj = this.mongoQueryObj.select(fields);
        } else {
            this.mongoQueryObj = this.mongoQueryObj.select('-__v');
        }
        return this;
    }
    

    paginate() {

        const page = this.userQueryObj.page * 1 || 1;
        const limit = this.userQueryObj.limit * 1 || process.env.RES_ALBUM_LIMIT * 1;
        const skip = (page - 1) * limit;
        this.mongoQueryObj = this.mongoQueryObj.skip(skip).limit(limit);
        return this;
    }

}