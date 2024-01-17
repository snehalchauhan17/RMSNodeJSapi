// var express = require('express');

// var UserMasterController = require('../src/UserMaster/UserMasterController');
// const router = express.Router();
// router.route('/UserMaster/login').post(UserMasterController.loginUserControllerFn);
// router.route('/UserMaster/create').post(UserMasterController.createUserControllerFn);
// app.use(express.json());
// module.exports = router;


const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../src/UserMaster/MUserMasterModel')
const router = Router()

router.post('/MUserMaster', async (req, res) => {
  let name = req.body.name
  let username = req.body.username
  let password = req.body.password
console.log(password)
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
      password: hashedPassword
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
  res.send("Login User")
})

router.get("/MUserMaster", async (req, res) => {
 
  try{
const cookie =req.cookies['jwt']
const claims =jwt.verify(cookie,"secret")
if(!claims){
  return res.status(401).send({
    message:"unauthenticated"
  })
}
const user = await User.findOne({_id:claims._id})

const {password,...data} = await user.toJSON()
res.send(data)
  }
  catch(err){

  }
})

module.exports = router;