const mongoose = require('mongoose')
const dataentryschema =mongoose.Schema(
    {
    Id:             { type: String, unique: true, required:true },    
    Year:           { type: String, required: true  },
    Branch:         { type: String, required:true },
    Category:       { type: String, required: true },
    Types:          { type: String, required: true },
    Subject:        { type: String, required: true },
    Name:           { type: String, required: true },
    Address:        { type: String, required: true },
    Village:        { type: String, required: true },
    Taluka:         { type: String, required: true },
    OrderName 	:         { type: String, required: true },
    CupBoardNo :         { type: String, required: true },
    PartitionNo:         { type: String, required: true },
    FileNo 		:         { type: String, required: true },
    NotePage 	:         { type: String, required: true },
    PostPage 	:         { type: String, required: true },
    TotalPage  :         { type: String, required: true },

    DocumentName: { type: String, required: true },
    DocumentID :  { type: String, required: true },
    },
    {
        timestamps : true
    }

)


const DataEntry =mongoose.model('DataEntry',dataentryschema);

module.exports =DataEntry;