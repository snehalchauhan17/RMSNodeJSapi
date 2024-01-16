const mongoose = require('mongoose')
const musermasterSchema =mongoose.Schema(
    {
      
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
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