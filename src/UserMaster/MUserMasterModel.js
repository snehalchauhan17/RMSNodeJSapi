const mongoose = require('mongoose')
const musermasterSchema =mongoose.Schema(
    {
      
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required:true
    },
    password: {
        type: String,
        required: true
    }
 
    },
    {
        timestamps : true
    }

)

const MUserMaster =mongoose.model('MUserMaster',musermasterSchema);
module.exports =MUserMaster;