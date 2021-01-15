const student = require("../schema/studentschema")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const vision = require('@google-cloud/vision');
dotenv.config({ path: '../config.env' });
const multer = require('multer');
const course = require('../schema/courseschema');
const { promisify } = require('util');


exports.newstudent = async (req, res) => {
    try {
        const newstudent = await student.create(req.body);
        res.send(newstudent);
    }
    catch (err) {
        res.send(err);
    }
}





//SignUp
exports.signup = async (req, res) => {
    try {
        const currstudent = await student.findOne({
            email: req.body.email,
            name: req.body.name,
            rollno: req.body.rollno,
            branch: req.body.branch
        });
        if (!currstudent) throw 'Student not found';
        if (currstudent.status != 'inactive') throw 'Already registered';
        currstudent.password = await bcrypt.hash(req.body.password, 12);;
        currstudent.status = 'active';
        currstudent.save();
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



//LogIn

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw 'Incorrect email or password';
        const currstudent = await student.findOne({ email: email });
        if (!currstudent) throw 'Student not found';
        if (currstudent.status == 'inactive') throw 'Please signup and set password first';

        if (!await bcrypt.compare(password, currstudent.password)) throw 'Incorrect password';
        const id = await currstudent._id;
        const token = jwt.sign({ id }, 'iamadumb', { expiresIn: '90d' });
        currstudent.password = undefined;
        res.json({
            status: "success",
            token: token,
            student: currstudent
        })
    }
    catch (err) {
        res.json({
            status: "error",
            message: err
        })
    }
}







