// var express = require('express');

// var UserMasterController = require('../src/UserMaster/UserMasterController');
// const router = express.Router();
// router.route('/UserMaster/login').post(UserMasterController.loginUserControllerFn);
// router.route('/UserMaster/create').post(UserMasterController.createUserControllerFn);
// app.use(express.json());
// module.exports = router;


const {Router} = require('express')
const bcrypt =require('bcryptjs')
//const jwt =require('jsonwebtoken')
const User =require('../src/UserMaster/MUserMasterModel')
const router =Router()

router.post('/MUserMaster',async(req,res)=>{
      try{
        const UserMaster= await User.create(req.body)
        res.status(200).json(UserMaster);
    
      }
      catch(error){
    console.log(error.message);
    res.status(500).json({message:error.message});
      }
    })
     module.exports = router;