const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name : {type : String , required : true},
    email : {type : String , required : true , unique : true},
    phone : {type: Number, required : false},
    source : {type : String},
    description : {type : String},
    dueDate : {type : Date},
    status : {type : String, default : 'Pending'}
}, {timestamps : true});

const Lead = mongoose.model('lead' , LeadSchema);
module.exports = Lead;