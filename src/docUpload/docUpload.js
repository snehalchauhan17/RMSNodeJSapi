
// const router = Router()
// const multer = require('multer');
// const docUpload = require('../src/docUpload/docUploadModel');
// const storage =multer.memoryStorage()
// const upload = multer({storage:storage})

// router.get('/fileUpload',async(req,res)=> {
//     try {
//         const user = await docUpload.find();
//   -
//         res.status(200).json(user);
//     } catch(error) {
//         res.status(404).json({message: error.message});
//     }
// })

// router.post('/upload',upload.single('docUpload'),async(req,res)=>{
//     console.log(req.params.doc)
//      if (!req.docUpload) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }
//     const doc = new docUpload({
//         name: req.file.originalname,
//         doc:{
//             data:req.file.buffer,
//             contentType:req.file.mimetype
//         }
//     })
//     await doc.save()
//     res.send({
//               message: "File uploaded successfully!",
//               user: result
//             })
// })

// // //Upload File
// //     // const storage = multer.diskStorage({
// //     //   destination: (req, file, cb) => {
// //     //     cb(null, 'uploads/');
// //     //   },
// //     //   filename: (req, file, cb) => {
// //     //     cb(null, Date.now() + '-' + file.originalname);
// //     //   },
// //     // });
// //     const storage = multer.diskStorage({
// //         destination: (req, file, cb) => {
// //           cb(null, 'Uploads/');
// //         },
// //         filename: (req, file, cb) => {
// //           cb(null, Date.now() + '-' + file.originalname);
// //         },
// //       });
// //   const upload = multer({ storage });
  
  
// //   router.post('/upload', upload.single('file'),async (req, res) => {
  
// //     // if (!req.file) {
// //     //   return res.status(400).json({ error: 'No file uploaded' });
// //     // }
// //     // res.json({ message: 'File uploaded successfully', filename: req.file.filename });
// //     const { filename, path } = req.file;
  
// //     // Save file metadata to MongoDB
// //     const file = new fileUpload({ filename, path });
// //     const result = await file.save();
// //     res.send({
// //       message: "File uploaded successfully!",
// //       user: result
// //     })
// //    // res.send('File uploaded successfully!');
// //   });
//   module.exports = router;