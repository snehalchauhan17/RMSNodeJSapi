
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

// // Refresh Token API
// router.get("/refresh", (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     return res.status(401).json({ message: "Unauthorized: No refresh token" });
//   }

//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: "Forbidden: Invalid refresh token" });
//     }

//     // Generate a new Access Token
//     const newAccessToken = jwt.sign(
//       { _id: user._id, username: user.username },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "15m" }
//     );

//     res.json({ accessToken: newAccessToken });
//   });
// });



module.exports = router;