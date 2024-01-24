const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String, // Reference or path to the file data in the file system
  // Other metadata fields
});

const File = mongoose.model('File', fileSchema);
module.exports =File;