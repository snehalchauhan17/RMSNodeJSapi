const { Double, Int32 } = require('mongodb');
const mongoose = require('mongoose')
const branchMasterSchema = mongoose.Schema(
    {

        districtId: { type: Number },
        officeId: { type: Number },
        BranchName: { type: String }

    },
    {
        timestamps: true
    }

)

const BranchMasterModel = mongoose.model('BranchMaster', branchMasterSchema);
module.exports = BranchMasterModel;