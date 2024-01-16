// var UserMasterModel = require('./UserMasterModel');
// var key = '123456789trytryrtyr';
// var encryptor = require('simple-encryptor')(key);
// module.exports.crea = (userDetails) => {


//    return new Promise(function myFn(resolve, reject) {

//        var userModelData = new UserMasterModel();

//        userModelData.firstname = userDetails.firstname;
//        userModelData.lastname = userDetails.lastname;
//        userModelData.email = userDetails.email;
//        userModelData.password = userDetails.password;
//        var encrypted = encryptor.encrypt(userDetails.password);
//        userModelData.password = encrypted;

//        userModelData.save(function resultHandle(error, result) {

//            if (error) {
//                reject(false);
//            } else {
//                resolve(true);
//            }
//        });

//    });

// }

// module.exports.loginUserDBService = (userDetails)=> 
// {
//    return new Promise(function myFn(resolve, reject) 
//    {
//     UserMasterModel.findOne({ email: userDetails.email},function getresult(errorvalue, result)
//       {
//          if(errorvalue)
//          {
//             reject({status: false, msg: "Invaild Data"});
//          }
//          else
//          {
//             if(result !=undefined &&  result !=null)
//             {
//                var decrypted = encryptor.decrypt(result.password);

//                if(decrypted== studentDetails.password)
//                {
//                   resolve({status: true,msg: "User Validated Successfully"});
//                }
//                else
//                {
//                   reject({status: false,msg: "User Validated failed"});
//                }
//             }
//             else
//             {
//                reject({status: false,msg: "User Error Detailssss"});
//             }

//          }
      
//       });
      
//    });
// }