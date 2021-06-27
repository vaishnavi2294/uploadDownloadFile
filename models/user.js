
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new mongoose.Schema({
   name:String,
      password:String,
      number:Number
   

})
userSchema.plugin(passportLocalMongoose)


 module.exports = mongoose.model('user',userSchema)