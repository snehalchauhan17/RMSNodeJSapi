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
    },
    dcode: {
        type: String,
        required: true
    },
    officeId: {
        type: String,
        required: true
    },
    branchId: {
        type: String,
        required: true
    },
    RoleId: {
        type: String,
        required: true
    },
    SessionId: {
        type: String,
        required: false, // 👈 Make it optional
        default: null    // 👈 Optional: default to null
      }
    
    },
    {
        timestamps : true
    }


)

const MUserMaster =mongoose.model('MUserMaster',musermasterSchema);
module.exports =MUserMaster;