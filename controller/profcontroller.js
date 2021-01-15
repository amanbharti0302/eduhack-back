const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const vision = require('@google-cloud/vision');
const { json } = require('body-parser');

dotenv.config({ path: '../config.env' });

var convertapi = require('convertapi')(`CTVzDphSMCeUP5X0`);
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const professor = require('../schema/profschema');
const student = require('../schema/studentschema');
const textdata = require('../schema/textshema');
const course = require('../schema/courseschema');

const router = require('../router/courserouter');
const { promisify } = require('util');


exports.getteacher = async (req, res) => {
    try {
        const token = await req.body.token;
        if (!token) throw 'authentication failed';
        const decoded_id = await promisify(jwt.verify)(token, 'iamadumb');
        const currstudent = await professor.findById(decoded_id.id);
        currstudent.password = '';
        res.json({
            status: "success",
            message: currstudent
        })
    }
    catch (err) {
        res.json({
            status: "error",
            message: err
        })
    }
}




exports.newprofessor = async (req, res) => {
    try {
        const newprofessor = await professor.create(req.body);
        res.send(newprofessor);
    }
    catch (err) {
        res.send(err);
    }
}

exports.checklogin = async (req, res, next) => {
    /////////////////////////For Checking whether professor is logged in or not
}

exports.signup = async (req, res) => {
    try {
        const currprofessor = await professor.findOne({ email: req.body.email });
        if (!currprofessor) throw 'professor not found';
        if (currprofessor.status != 'inactive') throw 'Already registered';
        currprofessor.password = await bcrypt.hash(req.body.password, 12);;
        currprofessor.status = 'active';
        currprofessor.save();
        res.json({
            status: "success",
            message: currprofessor
        })
    }
    catch (err) {
        res.json({
            status: "error",
            message: err
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw 'Incorrect email or password';
        const currprofessor = await professor.findOne({ email: email });
        if (!currprofessor) throw 'Professor not found';
        if (currprofessor.status == 'inactive') throw 'Please signup and set password first';

        if (!await bcrypt.compare(password, currprofessor.password)) throw 'Incorrect password';
        const id = await currprofessor._id;
        const token = jwt.sign({ id }, 'iamadumb', { expiresIn: '90d' });
        currprofessor.password = undefined;
        res.json({
            status: "success",
            token: token,
            professor: currprofessor
        })
    }
    catch (err) {
        res.json({
            status: "error",
            message: err
        })
    }
}

