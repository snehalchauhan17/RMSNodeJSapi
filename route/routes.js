
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../src/UserMaster/MUserMasterModel')
const DataEntry = require('../src/DataEntry/DataEntryModel')
const router = Router()
const fileUpload = require('../src/DataEntry/FileUpload')

const multer = require('multer');
const docUpload = require('../src/docUpload/docUploadModel');
const storage =multer.memoryStorage()
const upload = multer({storage:storage})

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
    let documentId = ''
   

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
      documentId:documentId
 
      
    })
    const result = await dataentry.save()
    console.log(result);
console.log(dataentry.documentId)

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
          return res.status(404).json({ message: 'Cannot find Record' })
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



// router.get('/files/:filename', async (req, res) => {

//   try {
//       const file = await docUpload.find();
// -
//       res.status(200).json(file);
//   } catch(error) {
//       res.status(404).json({message: error.message});
//   }
// });


// app.get('/api/files/:_id', (req, res) => {
//   const _id = req.params._id;
//   const filePath = path.join(__dirname, 'uploads', _id); // Adjust the path as per your file storage setup

//   // Check if the file exists
//   fs.access(filePath, fs.constants.F_OK, (err) => {
//       if (err) {
//           console.error('File does not exist:', err);
//           return res.status(404).send('File not found');
//       }

//       // Stream the file back to the client
//       const fileStream = fs.createReadStream(filePath);
//       fileStream.pipe(res);
//   });
// });
router.get('/DocList', async (req, res) => {

  try {
      const user = await docUpload.find();
-
      res.status(200).json(user);
  } catch(error) {
      res.status(404).json({message: error.message});
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
  }

  // Assuming docUpload is your Mongoose model for storing documents
  const newDoc = new docUpload({
      name: req.file.originalname,
      doc: {
          data: req.file.buffer,
          contentType: req.file.mimetype
      }
  });

  try {
      // Save the document
      const savedDoc = await newDoc.save();
      res.status(201).json({
          message: 'File uploaded successfully!',
          document: savedDoc
      });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;