
const mongoose = require('mongoose')
const { Schema } = mongoose;
//const docUpload =require('../docUpload/docUploadModel');
const { ObjectId } = require('mongodb');


const dataentryschema_H = new Schema(
  {
    originalId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataEntry' }, // ✅ Stores reference to the main record
    action: { type: String, required: true }, 
    updatedBy: { type: String }, 
    ipAddress: { type: String }, 
    updatedOn: { type: Date, default: Date.now },
    historyDate: { type: Date, default: Date.now }, // ✅ Add history date
    recordData: { type: Object, required: true }, // ✅ Stores all the record's data
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt and updatedAt
  }
);
const DataEntry_H = mongoose.model('DataEntry_H', dataentryschema_H);




module.exports =DataEntry_H;