const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
// MongoDB connection string and options
// const mongoURI = 'mongodb://admin:admin123@10.154.2.63:27017/?authSource=admin';
const options = {
    dbName: dbName

    // , // Specify the database name here
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
};

// Mongoose connection state flag
let mongooseConnected = false;

// MongoClient connection state flag
let mongoClientConnected = false;
let dbInstance;

// MongoDB connection with Mongoose
const connectToMongoose = async () => {
    if (mongooseConnected) {
        // console.log("Already connected to MongoDB with Mongoose.");
        return;
    }

    try {
        await mongoose.connect(mongoURI, options);
        mongooseConnected = true;
        console.log("Connected to MongoDB with Mongoose");
    } catch (error) {
        console.error("Error connecting to MongoDB with Mongoose:", error);
        process.exit(1); // Exit the process if connection fails
    }
};


const connections = {}; // Cache for Mongoose connections per db
const getMongooseConnection = async (dcode) => {
    console.log("Connecting to Mongoose with dcode:", dcode);

    const DB_District = dcode ? `RMSD_${dcode}` : process.env.DB_NAME;

    if (connections[DB_District]) {
        return connections[DB_District];
    }

    const conn = await mongoose.createConnection(process.env.MONGO_URI, {
        dbName: DB_District,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    connections[DB_District] = conn;
    console.log(`✅ Mongoose connected to DB: ${DB_District}`);
    return conn;
};

// MongoDB connection with MongoClient
const connectToMongoClient = async () => {
    if (mongoClientConnected) {
        // console.log("Already connected to MongoDB with MongoClient.");
        return dbInstance;
    }

    try {
        const client = new MongoClient(mongoURI, options);
        await client.connect();

        dbInstance = client.db(dbName);
        mongoClientConnected = true;
        console.log("Connected to MongoDB with MongoClient");
        return dbInstance;
    } catch (error) {
        console.error("Error connecting to MongoDB with MongoClient:", error);
        process.exit(1); // Exit the process if connection fails
    }
};

// Export both connection functions
module.exports = {
    connectToMongoose,
    connectToMongoClient,
    getMongooseConnection
};
