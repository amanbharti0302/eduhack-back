const mongoose = require('mongoose');

const courseschema = new mongoose.Schema({
    name: {
        type: String,
        unique: [true]
    },
    branch: {
        type: String
    },
    coursecode: {
        type: String,
        unique: [true]
    },
    enrolledstudent: {
        type: Array
    },
    assignment: {
        type: Array
    }
});

const course = mongoose.model('course', courseschema);
module.exports = course;