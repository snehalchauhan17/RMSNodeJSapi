
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser')
var route = require('./route/routes');
const { connectToMongoose, connectToMongoClient } = require('./dbconfig');

//const multer = require('multer')
const app = express()
const DataEntry = require('./src/DataEntry/DataEntryController'); 
const docUpload = require('./src/docUpload/docUploadController'); 
const UserMaster = require('./src/UserMaster/UserMasterController');
const branchmaster = require('./src/BranchMaster/BranchMasterController');
const officemaster = require('./src/OfficeMaster/OfficeMasterController');
const imagedata= require('./src/ImageData/ImageData');
const corsOptions = {
  origin: 'http://10.154.2.172:4200', // Replace with the origin of your Angular app
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


const port = process.env.PORT || 3000;

// Establish the MongoDB connection
connectToMongoose() // First establish mongoose connection
  .then(() => connectToMongoClient()) // Then establish MongoClient connection
  .then(() => {
    // Start the server after successful DB connections
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://10.154.2.172:${port}/`);
    });
  })
  .catch((err) => {
    console.error('Failed to start the server due to database connection error:', err);
  });



//mongodb://sa:sa123@10.154.2.131:27017/
//mongoose.connect("mongodb://localhost:27017/RMS")

// const mongoURI = 'mongodb://admin:admin123@10.154.2.63:27017/?authSource=admin';
// const port = process.env.PORT || 3000;

// const options = {

//   dbName: 'RMS', // Specify the database name here
// };

// Connect to MongoDB
// mongoose.connect(mongoURI, options)
//   .then(() => {
//     console.log('Connected to MongoDB');

//     // Start the server after successful DB connection
//     app.listen(port, '0.0.0.0', () => {
//       console.log(`Server running at http://10.154.2.172:${port}/`);
//     });
//   })
//   .catch(err => {
//     console.error("Error connecting to the database:", err);
//   });
// Options to pass to the MongoDB driver during connection setup


// mongoose.connect(mongoURI, options)
// .then(()=>{
//           console.log('connect to MongoDB')
//         // app.listen(3001, ()=> {
//         //     console.log('Node API app is running on port 3001')
//         // })
//         app.listen(port, '10.154.2.172', () => {
//           console.log(`Server running at http://10.154.2.172:${port}/`);
//         })
//     }).catch((error)=>{
//         console.log(error)
//     });
    
   

mongoose.set('strictQuery', false);
app.use("/api",route)
app.use("/api",DataEntry)
app.use("/api",imagedata)
app.use("/api",docUpload)
app.use("/api",UserMaster)
app.use("/api",branchmaster)
app.use("/api",officemaster)
app.options('*', cors()); 


