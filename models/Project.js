const mongoose = require('mongoose');

const Issue = new mongoose.Schema({
    _id : {type : String,},
    issue_title : {type : String,required : true,},
    issue_text : {type : String,required : true},
    created_by : {type : String,required : true},
    assigned_to : {type : String},
    status_text : {type : String},
    open : {type : Boolean,default : true},
    created_on : {type : Date,default : new Date()},
    updated_on : {type : Date,default : new Date()}
})

const ProjectSchema = new mongoose.Schema({
    project : {type : String,required : true},
    issues : {type : Array,value : Issue}},
    {versionKey : false})


const Project = mongoose.model('Project',ProjectSchema);

module.exports = Project