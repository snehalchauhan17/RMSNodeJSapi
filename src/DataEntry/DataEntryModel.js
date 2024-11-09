const mongoose = require('mongoose')
//const docUpload =require('../docUpload/docUploadModel');
const { ObjectId } = require('mongodb');
const dataentryschema =mongoose.Schema(
    {

    Year        :           { type: String, required: true },
    IssueDate   :           { type: String, required: true },
    Branch      :         	{ type: String, required:true  },
    Category    :       	{ type: String },
    Name        :           { type: String },
    Address     :        	{ type: String },
    Subject     :        	{ type: String },
    HukamNo     :        	{ type: String },
    HukamDate   :        	{ type: String },
    Taluka      :         	{ type: String },
    Village     :        	{ type: String },
    SurveyNo 	:           { type: String },
    CompactorNo :           { type: String },
    PotlaNo     :           { type: String },
    FeristNo 	:           { type: String },
    NotePage 	:           { type: String },
    PostPage 	:           { type: String },
    TotalPage   :           { type: String },
    anyDetail   : 		    { type: String },
	documentId  :           { type:ObjectId},
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