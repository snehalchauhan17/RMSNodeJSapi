
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../src/UserMaster/MUserMasterModel')
const router = Router()
const multer = require('multer');
const storage =multer.memoryStorage()
const upload = multer({storage:storage})


router.get("/getName", async (req, res) => {

  try {
    const cookie = req.cookies['jwt']
    const claims = jwt.verify(cookie, "secret")
    if (!claims) {
      return res.status(401).send({
        message: "unauthenticated"
      })
    }
    const user = await User.findOne({ _id: claims._id })

    const { password, ...data } = await user.toJSON()
    res.send(data)
  }
  catch (err) {

  }
})




module.exports = router;