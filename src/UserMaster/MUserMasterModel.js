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
 
    // 🟢 Move RoleId BEFORE branchId
    RoleId: {
      type: Number, // 🛠 Changed to Number so we can compare with === 1
      required: true
    },

    // 🟢 Now RoleId will be available for validation
    branchId: {
      type: Number,
      required: function () {
        return this.RoleId !== 1;
      }
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