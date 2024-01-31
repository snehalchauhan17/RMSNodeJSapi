const { default: mongoose } = require("mongoose");

const docSchema = new mongoose.Schema({
    name:String,
    doc:{
        data:Buffer,
        contentType:String
    }
    }
})