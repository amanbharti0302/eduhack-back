const mongoose = require('mongoose');
const assignmentschema = new mongoose.Schema({
    name:{
        type:String,
        unique:[true]
    },
    description:{
        type:String
    },
    student:{
        type:Array,
        default:[]
    },
    score:{
        type:Array,
        default:[]
    },
    date:{
        type:Date,
        default:Date.now()
    }
});

const assignment = mongoose.model('assignment',assignmentschema);
module.exports = assignment;