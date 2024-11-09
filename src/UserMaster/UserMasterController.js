
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../UserMaster/MUserMasterModel')
const router = Router()
const multer = require('multer');
const storage =multer.memoryStorage()
const upload = multer({storage:storage})


router.get("/RoleList", async (req, res) => {
  try {
    const db = client.db(dbName); // Get the database instance
    const collection = db.collection("RoleMaster"); // Get the collection
    const results = await collection.find({}).toArray(); // Query the collection
    res.status(200).send(results); // Send the results as the response

  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});
// router.get('/admin', verifyRole(['admin']), (req, res) => {
//   res.send('Welcome Admin');
// });
// const verifyRole = (roles) => (req, res, next) => {
//   const token = req.cookies.jwt;  // Get token from cookies
//   if (!token) {
//     return res.status(401).send({ message: 'Unauthorized' });
//   }

//   jwt.verify(token, "secret", (err, decoded) => {
//     if (err) {
//       return res.status(403).send({ message: 'Forbidden' });
//     }
//     if (roles.includes(decoded.role)) {
//       next();  // Continue to the next middleware if the role matches
//     } else {
//       res.status(403).send({ message: 'Access Denied' });  // Deny access if role doesn't match
//     }
//   });
// };
router.post('/MUserMaster', async (req, res) => {
    let name = req.body.name
    let username = req.body.username
    let password = req.body.password
    let dcode = req.body.dcode
    let officeId = req.body.officeId
    let branchId = req.body.branchId
    let role = req.body.role || 'user';  // Default to 'user' role if not provided
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
  
    const record = await User.findOne({ username: username })
    if (record) {
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
        role: role  // Role is set here

      })
      const result = await user.save()
  
      //JWT Token 
      const { _id, role } = await result.toJSON();

    
      const token = jwt.sign({ _id: _id, role: role }, "secret", { expiresIn: '2h' });

      // const token = jwt.sign({ _id: _id }, "secret");
  
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000
      });
      res.json({
        message: "success",
        user: result
      });
    }
  });
  
  
  router.post("/login", async (req, res) => {
    let pwd = req.body.password
    let username = req.body.username
  
    const user = await User.findOne({ username: req.body.username })
    if (!user) {
      return res.status(404).send({
        message: "User Not Found"
      })
    }
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).send({
        message: "Password is InCorrect"
      })
    }
    const token = jwt.sign({ _id: user._id }, "secret")
  
    const result = await user.save()
  
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000
    })
   
    res.send({
      message: "success",
      user: result
    })
  });
  
  router.post("/logout", async (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 })
    res.send({ message: "success" })
  })
  
  router.post('/ChangePassword', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
  
    try {
      const user = await User.findOne({ username });
  
      if (!user || user.password !== oldPassword) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      user.password = newPassword;
      await user.save();
  
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  module.exports = router;
  