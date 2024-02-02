
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser')
var route = require('./route/routes');
//const multer = require('multer')
const app = express()
const DataEntry = require('./src/DataEntry/DataEntryController'); 
const docUpload = require('./src/docUpload/docUploadController'); 

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

mongoose.connect("mongodb://localhost:27017/RMS")
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
app.options('*', cors()); 


