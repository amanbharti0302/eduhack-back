const mongoose = require('mongoose');
const { strategy } = require('sharp');

const profschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobno: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    course: {
        type: Array
    },
    status: {
        type: String,
        default: "inactive"
    },
    password: {
        type: String
    }
})

const professor = mongoose.model('professor', profschema);

module.exports = professor;