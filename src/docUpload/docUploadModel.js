//const mongoose = require("../database");

const mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
	name: String,
	desc: String,
	doc:
	{
		data: Buffer,
		contentType: String
	}
});

//Image is a model which has a schema imageSchema
const docUpload = mongoose.model('docUpload', fileSchema);

module.exports = docUpload;
