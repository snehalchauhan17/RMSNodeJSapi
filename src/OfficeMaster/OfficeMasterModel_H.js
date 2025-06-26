
const mongoose = require('mongoose')
const { Schema } = mongoose;
//const docUpload =require('../docUpload/docUploadModel');
const { ObjectId } = require('mongodb');


const officeMasterschema_H = new Schema(
  {
    originalId: { type: mongoose.Schema.Types.ObjectId, ref: 'OfficeMastermodel' }, // ✅ Stores reference to the main record
    action: { type: String, required: true }, 
    updatedBy: { type: String }, 
    ipAddress: { type: String }, 
    updatedOn: { type: Date, default: Date.now },
    historyDate: { type: Date, default: Date.now }, // ✅ Add history date
    officeData: { type: Object, required: true }, // ✅ Stores all the record's data
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt and updatedAt
  }
);
const OfficeMaster_H = mongoose.model('OfficeMaster_H', officeMasterschema_H);

module.exports = OfficeMaster_H;