
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../src/UserMaster/MUserMasterModel')
const DataEntry = require('../src/DataEntry/DataEntryModel')
const router = Router()
const multer = require('multer');
const fileUpload = require('../src/DataEntry/FileUpload')

router.post('/MUserMaster', async (req, res) => {
  let name = req.body.name
  let username = req.body.username
  let password = req.body.password

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

router.post("/logout", async (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 })
  res.send({ message: "success" })
})





//Data Enter
router.post('/InsertRecord', async (req, res) => {
	//  let Id			     = req.body.Id			             
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
    let PartitionNo = req.body.PartitionNo
    let FileNo = req.body.FileNo
    let NotePage = req.body.NotePage
    let PostPage = req.body.PostPage
    let TotalPage = req.body.TotalPage	  
    let DocumentName = req.body.DocumentName
    // let DocumentID   = req.body.DocumentID  

    const dataentry = new DataEntry({

     // Id			    : Id		,	
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
      // DocumentID  : DocumentID  
      
    })
    const result = await dataentry.save()


    res.json({
      message: "success",
      dataentry: result
    });
  });



  //Data Update
  router.put('/UpdateRecord', async (req, res) => {
  //   if(!req.body) {
  //     res.status(400).send({
  //         message: "Data to update can not be empty!"
  //     });
  // }
  
  const id = req.body._id;

  
  await DataEntry.findByIdAndUpdate(id, req.body).then(data => {
 
      if (!data) {
          res.status(404).send({
              message: `User not found.`
          });
      }else{
          res.send({ message: "User updated successfully." })
      }
  }).catch(err => {
      res.status(500).send({
          message: err.message
      });
  });
  });


  //Data Delete
  router.delete('/DeleteRecord', async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({ message: 'Missing _id field in request body' });
        }

        const deletedRecord = await DataEntry.findByIdAndRemove(_id);

        if (!deletedRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }

        return res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});



//Data Select
// router.get('/FindRecordbyID', async (req, res) => {
//   try {

//       const user = await DataEntry.findById(req.params._id);
//       res.status(200).json(user);
//   } catch(error) {
//       res.status(404).json({ message: error.message});
//   }
// });

router.get('/FindRecordbyID/:_id', async (req, res) => {
 // var _id = req.params._id
 console.log(req.params._id)
  let user = ''
  try {
    const user = await DataEntry.findById(req.params._id);
      if (user == null) { // checking for null values
          return res.status(404).json({ message: 'Cannot find programmer' })
      }
  } catch (err) {
      return res.status(500).json({ message: err.message })
  }

  res.send(user) //sending the response

})



// Retrieve all users from the database.
router.get('/RecordList', async (req, res) => {

  try {
      const user = await DataEntry.find();
-
      res.status(200).json(user);
  } catch(error) {
      res.status(404).json({message: error.message});
  }
});


//Upload File
    // const storage = multer.diskStorage({
    //   destination: (req, file, cb) => {
    //     cb(null, 'uploads/');
    //   },
    //   filename: (req, file, cb) => {
    //     cb(null, Date.now() + '-' + file.originalname);
    //   },
    // });
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'Uploads/');
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
      },
    });
const upload = multer({ storage });


router.post('/upload', upload.single('file'),async (req, res) => {

  // if (!req.file) {
  //   return res.status(400).json({ error: 'No file uploaded' });
  // }
  // res.json({ message: 'File uploaded successfully', filename: req.file.filename });
  const { filename, path } = req.file;

  // Save file metadata to MongoDB
  const file = new fileUpload({ filename, path });
  const result = await file.save();
  res.send({
    message: "File uploaded successfully!",
    user: result
  })
 // res.send('File uploaded successfully!');
});
module.exports = router;