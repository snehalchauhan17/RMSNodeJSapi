
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../UserMaster/MUserMasterModel')
const router = Router()
const multer = require('multer');
const storage =multer.memoryStorage()
const upload = multer({storage:storage})


router.post('/MUserMaster', async (req, res) => {
    let name = req.body.name
    let username = req.body.username
    let password = req.body.password
    let dcode = req.body.dcode
    let officeId = req.body.officeId
    let branchId = req.body.branchId

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
        branchId: branchId
      })
      const result = await user.save()
  
      //JWT Token 
  
      const { _id } = await result.toJSON()
  
      const token = jwt.sign({ _id: _id }, "secret");
  
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
  