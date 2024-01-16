
// app.get('/',(req,res)=>{
//     res.send('Hello Node API')
// })

// app.get('/blog',(req,res)=>{
//     res.send('Hello blog')
// })

// app.get('/products',async(req,res)=>{
//     try{
//         const products= await Product.find({});
//         res.status(200).json(products);
    
//       }
//       catch(error){
//     console.log(error.message);
//     res.status(500).json({message:error.message});
//       }
// })

// app.get('/products/:id',async(req,res)=>{
//     try{
//         const {id} =req.params;
//         const product= await Product.findById(id);
//         res.status(200).json(product);
    
//       }
//       catch(error){
//     console.log(error.message);
//     res.status(500).json({message:error.message});
//       }
// })
// app.post('/product',async(req,res)=>{
//   try{
//     const product= await Product.create(req.body)
//     res.status(200).json(product);

//   }
//   catch(error){
// console.log(error.message);
// res.status(500).json({message:error.message});
//   }
// })

// app.put('/product/:id',async(req,res)=>{
//     try{
//         const {id} =req.params;
//         const product= await Product.findByIdAndUpdate(id,req.body);
//         if(!product){
//             return res.status(404).json({message:'cant find any product with Id ${id}'})
//         }
//         const updatedProduct =await Product.findById(id);
//         res.status(200).json(updatedProduct);
    
//       }
//       catch(error){
//     console.log(error.message);
//     res.status(500).json({message:error.message});
//       }
// })

// app.delete('/product/:id',async(req,res)=>{
//     try{
//         const {id} =req.params;
//         const product= await Product.findByIdAndDelete(id);
//         if(!product){
//             return res.status(404).json({message:'cant find any product with Id ${id}'})
//         }
//         res.status(200).json(product);
    
//       }
//       catch(error){ 
//     console.log(error.message);
//     res.status(500).json({message:error.message});
//       }
// })

// mongoose.set('strictQuery',false)
// mongoose.connect('mongodb://localhost:27017')
// // mongoose.connect('mongodb+srv://admin:admin123@cluster0.v7a6kuo.mongodb.net/Node-API?retryWrites=true&w=majority')
// .then(()=>{
//       console.log('connect to MongoDB')
//     app.listen(3001, ()=> {
//         console.log('Node API app is running on port 3001')
//     })
   
// }).catch((error)=>{
//     console.log(error)
// })
const express = require('express')
const app = express()
var route = require('./route/routes');
const cors = require('cors');

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
//app.use(cors());

mongoose.set('strictQuery', false);
app.use("/api",route)
app.options('*', cors()); 

app.use(express.json());
app.use(cookieParser())
const corsOptions = {
  origin: 'http://localhost:4200', // Replace with the origin of your Angular app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // enable session cookies from the browser to be sent with each request
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
mongoose.connect("mongodb://localhost:27017/RMS",{useNewUrlParser: true,  useUnifiedTopology: true },)
.then(()=>{
          console.log('connect to MongoDB')
        app.listen(3001, ()=> {
            console.log('Node API app is running on port 3001')
        })
       
    }).catch((error)=>{
        console.log(error)
    });
   // 
app.use(route);

