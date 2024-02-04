const mongoose = require('mongoose')
//const docUpload =require('../docUpload/docUploadModel');
const { ObjectId } = require('mongodb');
const dataentryschema =mongoose.Schema(
    {

    Year:           	{ type: String, required: true },
    Branch:         	{ type: String, required:true  },
    Category:       	{ type: String },
    Types:          	{ type: String },
    Subject:        	{ type: String },
    Name:           	{ type: String },
    Address:        	{ type: String },
    Village:        	{ type: String },
    Taluka:         	{ type: String },
    OrderName 	:       { type: String },
    CupBoardNo :        { type: String },
    PartitionNo:        { type: String },
    FileNo 		:       { type: String },
    NotePage 	:       { type: String },
    PostPage 	:       { type: String },
    TotalPage  :        { type: String },
    DocumentName: 		{ type: String },
	documentId:         { type:ObjectId},
    // docId: {
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: 'docUpload',
    //     required: true
    // }

    },
    {
        timestamps : true
    }

)

const DataEntry =mongoose.model('DataEntry',dataentryschema);

module.exports =DataEntry;