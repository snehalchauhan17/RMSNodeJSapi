const mongoose = require('mongoose')
//const docUpload =require('../docUpload/docUploadModel');
const { ObjectId } = require('mongodb');
const officeMasterschema =mongoose.Schema(
    {

    office:           	{ type: String, required: true },
    id:         	    { type: Number, required: true  },
    officetype:       	{ type: String },
    dcode:          	{ type: Number },    	
    },
    {
        timestamps : true
    }
)

// const DataEntry =mongoose.model('DataEntry',dataentryschema);

// module.exports =DataEntry;

const OfficeMastermodel =mongoose.model('OfficeMastermodel',officeMasterschema);

module.exports =OfficeMastermodel;