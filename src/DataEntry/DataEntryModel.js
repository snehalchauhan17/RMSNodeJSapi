const mongoose = require('mongoose')
const { Schema } = mongoose;
//const docUpload =require('../docUpload/docUploadModel');
const { ObjectId } = require('mongodb');
// const dataentryschema =mongoose.Schema(
//     {

//     Year        :           { type: String, required: true },
//     IssueDate   :           { type: String, required: true },
//     Branch      :         	{ type: String, required:true  },
//     Category    :       	{ type: String },
//     Name        :           { type: String },
//     Address     :        	{ type: String },
//     Subject     :        	{ type: String },
//     HukamNo     :        	{ type: String },
//     HukamDate   :        	{ type: String },
//     DCode      :         	{ type: String },
//     Taluka      :         	{ type: String },
//     Village     :        	{ type: String },
//     SurveyNo 	:           { type: String },
//     CompactorNo :           { type: String },
//     PotlaNo     :           { type: String },
//     FeristNo 	:           { type: String },
//     NotePage 	:           { type: String },
//     PostPage 	:           { type: String },
//     TotalPage   :           { type: String },
//     anyDetail   : 		    { type: String },
// 	documentId  :           { type:ObjectId},
//     // docId: {
//     //     type: mongoose.SchemaTypes.ObjectId,
//     //     ref: 'docUpload',
//     //     required: true
//     // }
//     },
//     {
//         timestamps : true
//     }

// )
const dataentryschema = new Schema(
    {
      Year: { type: String},
      IssueDate: { type: Date },  // Change to Date type for better handling
      Branch: { type: String },
      Category: { type: String },
      Name: { type: String },
      Address: { type: String },
      Subject: { type: String },
      HukamNo: { type: String },
      HukamDate: { type: Date },  // Change to Date type for better handling
      DCode: { type: Number },
      Taluka: { type: Number },
      Village: { type: Number },
      SurveyNo: { type: String },
      CompactorNo: { type: String },
      PotlaNo: { type: String },
      FeristNo: { type: String },
      NotePage: { type: Number },  // Change to Number type
      PostPage: { type: Number },  // Change to Number type
      TotalPage: { type: Number },  // Change to Number type
      anyDetail: { type: String },
      documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },  // Reference to another collection
  
      // If you want to link another document (optional, uncomment if needed)
      // docId: { 
      //     type: mongoose.Schema.Types.ObjectId, 
      //     ref: 'docUpload', 
      //     required: true 
      // }
    },
    {
      timestamps: true,
    }
  );
const DataEntry =mongoose.model('DataEntry',dataentryschema);

module.exports =DataEntry;