
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../src/UserMaster/MUserMasterModel')
const DataEntry = require('../src/DataEntry/DataEntryModel')
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


router.get("/MUserMaster", async (req, res) => {

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
router.post("/login", async (req, res) => {
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
  const token = jwt.sign({ _id: user._id }, "secret key")

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 2 * 60 * 60 * 1000
  })
  res.send({
    message: "success"
  })
});
router.post("/logout", async (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 })
  res.send({ message: "success" })
})



router.post('/InsertRecord', async (req, res) => {
	  let Id			     = req.body.Id			             
    let Year         = req.body.Year        
    let Branch       = req.body.Branch      
    let Category     = req.body.Category    
    let Types        = req.body.Types       
    let Subject      = req.body.Subject     
    let Name         = req.body.Name        
    let Address      = req.body.Address     
    let Village      = req.body.Village     
    let Taluka       = req.body.Taluka    
    let OrderName = req.body.OrderName
    let CupBoardNo = req.body.CupBoardNo
    let PartitionNo = Req.body.PartitionNo
    let FileNo = Req.body.FileNo
    let NotePage = Req.body.NotePage
    let PostPage = Req.body.PostPage
    let TotalPage = Req.body.TotalPage	  
    let DocumentName = req.body.DocumentName
    let DocumentID   = req.body.DocumentID  

    const dataentry = new DataEntry({

      Id			    : Id		,	
      Year        : Year        ,
      Branch      : Branch      ,
      Category    : Category    ,
      Types       : Types       ,
      Subject     : Subject     ,
      Name        : Name        ,
      Address     : Address     ,
      Village     : Village     ,
      Taluka      : Taluka      ,
      OrderName 	: OrderName 	,
      CupBoardNo 	: CupBoardNo ,
      PartitionNo : PartitionNo ,
      FileNo 		: FileNo 		,
      NotePage 	: NotePage 	  ,
      PostPage 	: PostPage 	  ,
      TotalPage   : TotalPage   ,
      DocumentName: DocumentName,
      DocumentID  : DocumentID  
      
    })
    const result = await dataentry.save()

    res.json({
      message: "success",
      dataentry: result
    });
  });


module.exports = router;