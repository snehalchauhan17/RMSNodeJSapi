const path = require("path");
const environment = process.env.NODE_ENV || 'development';

// require('dotenv').config({
//   path: path.resolve(__dirname, `.env.${environment}`)
// });
// require('dotenv').config({
//   path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
// });

require('dotenv').config({
  path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || 'development'}`)
});

const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const helmet = require("helmet");
const crypto = require("crypto");

const { connectToMongoose, connectToMongoClient } = require('./dbconfig');

// Import Routes
var route = require('./route/routes');
const DataEntry = require('./src/DataEntry/DataEntryController'); 
const docUpload = require('./src/docUpload/docUploadController'); 
const UserMaster = require('./src/UserMaster/UserMasterController');
const branchmaster = require('./src/BranchMaster/BranchMasterController');
const officemaster = require('./src/OfficeMaster/OfficeMasterController');


const app = express()
const port = process.env.PORT || 3000;

// ------------------ 1. Security & Middleware ------------------
// Secure HTTP Headers
app.use(helmet());

// // Enable CORS with specific origin
// const corsOptions = {
//   origin: 'http://10.154.2.172:4200', // Replace with the origin of your Angular app
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true, // enable session cookies from the browser to be sent with each request
//   optionsSuccessStatus: 204,
//   allowedHeaders: ["Authorization", "Content-Type"] // ✅ Allow Authorization header

// };

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://rms.gujarat.gov.in']
  : ['http://10.154.2.172:4200'];

const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Authorization", "Content-Type"]
};
app.use(cors(corsOptions));

// Parse JSON & URL-encoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie Handling
app.use(cookieParser());
app.enable('trust proxy');

// Remove X-Powered-By header (to hide Express usage)
app.disable("x-powered-by");

// Static File Serving
app.use(express.static("public"));


// ------------------ 2. Database Connection ------------------
// Establish the MongoDB connection
mongoose.set("strictQuery", false);
connectToMongoose() // First establish mongoose connection
  .then(() => connectToMongoClient()) // Then establish MongoClient connection
  .then(() => {
    // Start the server after successful DB connections
       app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server running at http://0.0.0.0:${port} in ${environment} mode`);
    });
  })
  .catch((err) => {
    console.error('Failed to start the server due to database connection error:', err);
  });

// ------------------ 3. Routes ------------------
app.use("/api",route)
app.use("/api",DataEntry)
app.use("/api",docUpload)
app.use("/api",UserMaster)
app.use("/api",branchmaster)
app.use("/api",officemaster)

app.options('*', cors()); 

// ------------------ 4. Security Headers Middleware ------------------
// Enforce HTTPS
app.use((req, res, next) => {
  if (!req.secure) {
    return res.status(403).json({ message: "HTTPS is required" });
  }
  next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
    //  scriptSrc: ["'self'", "https://trusted-cdn.com"], // Allow trusted scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Content Security Policy (CSP)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'");
  next();
});



// ✅ Function to Generate Secure Random Session ID
function generateSessionId() {
  return crypto.randomBytes(32).toString("hex"); // 64-character random ID
}

// -----------------6. Error Handling Middleware -----------------

// 404 Error - Route Not Found
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: "Requested resource not found",
      status: 404,
    },
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);

  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  });
});



// ------------------ 7. Handle Uncaught Errors ------------------


// Handle Uncaught Exceptions & Promise Rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Exit the process with error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


// ------------------ 5. Secure Cookies Middleware ------------------

// Global function to set secure cookies
// app.use((req, res, next) => {
//   res.cookie('sessionId', 'randomValue', {
//     httpOnly: true,        // Prevents JavaScript access
//     secure: true,          // Ensures cookies are sent only over HTTPS
//     sameSite: 'Strict',    // Prevents CSRF attacks
//     maxAge: 24 * 60 * 60 * 1000 // Expires in 1 day
//   });

//   next();
// });

// Set global cookie options
// const globalCookieOptions = {
//   httpOnly: true,
//   secure: true, // Make sure to use HTTPS in production
//   sameSite: 'Strict', // or 'Lax', depending on your use case
//   // maxAge: 3600000, // Optional: 1 hour expiry
// };

// // Example usage in middleware:
// app.use((req, res, next) => {
//   res.setCookie = (name, value, options = {}) => {
//     const finalOptions = { ...globalCookieOptions, ...options };
//     res.cookie(name, value, finalOptions);
//   };
//   next();
// });
