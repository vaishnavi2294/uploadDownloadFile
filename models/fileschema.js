
var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
    filespath:String

})
 module.exports = mongoose.model('fileschema',fileSchema)