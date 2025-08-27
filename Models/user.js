const mongoose = require('mongoose') ;
 
const userSchema = new mongoose.Schema({
    username:{
        type:String , 
        required: true 
    } ,
    email :{
        type:String ,
        required :true 
    } ,
    mobile :{
        type:Number ,
        min:9 , 
    }
    ,
    password : {
        type:String , 
        min:8
    }
});

const User = mongoose.model("User" , userSchema) ;
module.exports = User ;