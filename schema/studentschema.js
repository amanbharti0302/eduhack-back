const mongoose = require('mongoose');

const studentschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobno: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    rollno: {
        type: String,
        required: true
    },
    course: {
        type: Array,
        required: true
    },
    status: {
        type: String,
        default: "inactive"
    },
    password: {
        type: String
    }
})

const student = mongoose.model('student', studentschema);

module.exports = student;