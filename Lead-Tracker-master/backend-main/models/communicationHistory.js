const mongoose = require('mongoose');

const CommSchema = new mongoose.Schema({
    leadId : {type: Schema.Types.ObjectId, required: true, ref: "lead",},
    date : {type : Date},
    type : {type : String},
    content : {type : String}
}, {timestamps : true});

const Comm = mongoose.model('comm' , CommSchema);
module.exports = Comm;