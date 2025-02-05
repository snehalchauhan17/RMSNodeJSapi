
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../UserMaster/MUserMasterModel')
const router = Router()
const multer = require('multer');
const storage =multer.memoryStorage()
const upload = multer({storage:storage})
// const MongoClient = require('mongodb').MongoClient;
// const connectionString = "mongodb://admin:admin123@10.154.2.63:27017/?authSource=admin";
// const dbName = "RMS";

const { connectToMongoClient } = require('../../dbconfig');

// // Create a reusable MongoDB client
// const client = new MongoClient(connectionString);

// // Connect to the MongoDB database
// client.connect()
//   .then(() => {
//     console.log('Connected to the database');
//   })
//   .catch(err => {
//     console.error('Error connecting to the database:', err);
//   });


router.get("/RoleList", async (req, res) => {
  try {
   
    const db = await connectToMongoClient();
    const collection = db.collection("RoleMaster"); // Get the collection
    const results = await collection.find({}).toArray(); // Query the collection
    res.status(200).send(results); // Send the results as the response

  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Retrieve all users from the database.
router.get('/UserDetailList', async (req, res) => {

  try {
      const user = await User.find();
      -
          res.status(200).json(user);
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
});

router.post('/MUserMaster', async (req, res) => {

  const { name, username, password, dcode, officeId, branchId, RoleId } = req.body;

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
  
    const existingUser  = await User.findOne({ username: username })
    if (existingUser) {
      return res.status(400).send({
        message: "Username is already Created"
  
      })
    }
    else {
      const user = new User({
        name: name,
        username: username,
        password: hashedPassword,
        dcode: dcode,
        officeId: officeId,
        branchId: branchId,
        RoleId: RoleId  // Role is set here

      })
 
      const result = await user.save()


      //JWT Token 
      
      //const { _id, username,RoleId } = await result.toJSON();
     // const token = jwt.sign({  _id: _id,username: username, RoleId: RoleId }, 'secret_jwt', { expiresIn: '1h' });
      const token = jwt.sign(
        { _id: result._id, username: result.username, RoleId: result.RoleId },
        'secret_jwt',
        { expiresIn: '1h' }
      );
  
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000
      });
      // res.send({
      //   message: "Registration successful",
      //   user: { _id: user._id, username: user.username, RoleId: user.RoleId ,token:token} // Responding with relevant user info
  
      // })
    res.json({ message: "Registration successful",
       user: { _id: user._id, username: user.username, RoleId: user.RoleId ,token:token,
         dcode:dcode,officeId:officeId,branchId:branchId } });

    }
  });
  
  
  router.post("/login", async (req, res) => {
    const { username, password,dcode,officeId ,branchId} = req.body;
    // Check if user exists
    const user = await User.findOne({ username: username})
    if (!user) return res.status(400).send({ message: "Invalid username or password" });
     
    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send({ message: "Invalid username or password" });
    
     // Generate JWT with RoleId,username included
    const token = jwt.sign(
      { _id: user._id, username: user.username, RoleId: user.RoleId ,dcode:user.dcode,officeId:user.officeId,branchId:user.branchId},
      'secret_jwt',
      { expiresIn: '1h' }
    );
  
  // Set HTTP-only cookie with JWT token
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000
    })

     // Send success message along with user data if needed (without sensitive data)
    res.send({
      message: "Login successful",
      user: { _id: user._id, username: user.username, RoleId: user.RoleId ,token:token, dcode:dcode,officeId:officeId,branchId:branchId} // Responding with relevant user info

    })
  });
  router.post("/logout", (req, res) => {
    // Clear the jwt cookie by setting it with maxAge: 0
    res.cookie("jwt", "", { maxAge: 0, httpOnly: true });
  
    // Respond with a success message
    res.send({ message: "Logged out successfully" });
  });

  // Change Password
 // const jwt = require('jsonwebtoken'); // Ensure JWT is imported

  router.post('/ChangePassword', async (req, res) => {
    const { token, oldPassword, newPassword } = req.body;
  
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, 'secret_jwt');
  
      const user = await User.findById(decoded._id); // Find user by decoded ID

      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      // Check if old password matches
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).send({ message: 'Incorrect old password' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
  
      // Save the updated user
      await user.save();
  
      // Respond with success message
      res.status(200).send({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Server error', error: err.message });
    }
  });
  
  
  // router.post('/ChangePassword', async (req, res) => {
  //   const { username, oldPassword, newPassword } = req.body;
  
  //   try {
  //     const user = await User.findOne({ username });
  
  //     if (!user || user.password !== oldPassword) {
  //       return res.status(400).json({ message: 'Invalid username or password' });
  //     }
  
  //     user.password = newPassword;
  //     await user.save();
  
  //     res.json({ message: 'Password changed successfully' });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // });
  
  
  module.exports = router;
  