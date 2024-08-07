
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser')
var route = require('./route/routes');
//const multer = require('multer')
const app = express()
const DataEntry = require('./src/DataEntry/DataEntryController'); 
const docUpload = require('./src/docUpload/docUploadController'); 
const UserMaster = require('./src/UserMaster/UserMasterController');
const branchmaster = require('./src/BranchMaster/BranchMasterController');
const officemaster = require('./src/OfficeMaster/OfficeMasterController');
const corsOptions = {
  origin: 'http://localhost:4200', // Replace with the origin of your Angular app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // enable session cookies from the browser to be sent with each request
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))
// app.use('view engine','ejs')
app.use(express.json());
//mongodb://sa:sa123@10.154.2.131:27017/
//mongoose.connect("mongodb://localhost:27017/RMS")
const mongoURI = 'mongodb://sa:sa123@10.154.2.131:27017/';

// Options to pass to the MongoDB driver during connection setup
const options = {
  dbName: 'RMS' // specify the database name here
};

//mongoose.connect("mongodb://sa:sa123@10.154.2.131:27017/RMS")
mongoose.connect(mongoURI, options)
.then(()=>{
          console.log('connect to MongoDB')
        app.listen(3001, ()=> {
            console.log('Node API app is running on port 3001')
        })
       
    }).catch((error)=>{
        console.log(error)
    });


mongoose.set('strictQuery', false);
app.use("/api",route)
app.use("/api",DataEntry)
app.use("/api",docUpload)
app.use("/api",UserMaster)
app.use("/api",branchmaster)
app.use("/api",officemaster)
app.options('*', cors()); 


