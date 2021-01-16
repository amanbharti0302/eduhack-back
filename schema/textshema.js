const mongoose = require('mongoose');
const { strategy } = require('sharp');

const textschema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    rollno:{
        type:String
    },
    text:{
        type:String
    },
    coursecode:{
        type:String
    },
    filelocation:{
        type:String
    },
    filename:{
        type:String
    },
    marks:{
        type:String,
        default:0
    },
    plagiarism:{
        type:Object
    }
})

const text = mongoose.model('text',textschema);
module.exports = text;