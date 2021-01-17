const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const vision = require('@google-cloud/vision');
const { json } = require('body-parser');

dotenv.config({path:'../config.env'});

var convertapi = require('convertapi')(`CTVzDphSMCeUP5X0`);
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const professor = require('../schema/profschema');
const student = require('../schema/studentschema');
const textdata = require('../schema/textshema');
const course = require('../schema/courseschema');
const assignment = require('../schema/assignmentschema');

const router = require('../router/courserouter');
const { promisify } = require('util');


exports.getteacher = async(req,res)=>{
    try{
        const token = await req.body.token;
        if(!token)throw 'authentication failed';
        const decoded_id = await promisify(jwt.verify)(token,'iamadumb');
        const currstudent =await professor.findById(decoded_id.id);
        currstudent.password='';
        res.json({
            status:"success",
            message:currstudent
        })
    }
    catch(err){
        res.json({
            status:"error",
            message:err
        })
    }
}


exports.getstudentreport = async (req, res) => {
    try {
        if (!req.files) throw ('file not found');
        const name = await req.body.name;
        const roll = await req.body.roll;
        const branch = await req.body.branch;
        const email = await req.body.email;

        const filename = await req.files[0].originalname;
        const filepath = await req.files[0].path;
        fs.renameSync(`${__dirname}/../${filepath}`, `${__dirname}/../filehandle/${filename}`, (err) => { if (err) console.log(err); })

        //console.log(filename);
        //console.log(req.files);
        //console.log(name);

        var data;
        var finaltext = "ll";

        var newtext = await textdata.create({ name: name, roll: roll, email: email, branch: branch, text: finaltext });


        await convertapi.convert('extract-images', { File: `./filehandle/${filename}` }, 'pdf').then(function (result) {
            return result.saveFiles(`${__dirname}/../img`);
        }).then(async (file) => {
            data = await file;
        })
            .catch((e) => {
                fs.unlinkSync(`${__dirname}/../filehandle/${filename}`);
                throw e;
            })

        await data.map(async (el) => {
            const clientOptions = { apiEndpoint: 'eu-vision.googleapis.com' };
            const client = new vision.ImageAnnotatorClient();
            const [result] = await client.textDetection(el);
            const fullTextAnnotation = result.fullTextAnnotation;
            finaltext = await finaltext + fullTextAnnotation.text;
            newtext.text = finaltext;
            await newtext.save();
            fs.unlinkSync(el);
        })

        fs.unlinkSync(`${__dirname}/../filehandle/${filename}`);
        res.send(newtext);
        //res.send('okk');
    }
    catch (err) {
        console.log(err);
        res.send('Either Wrong file format has been submitted.please try again later');
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
        const token = jwt.sign({ id }, 'iamadumb', { expiresIn:'90d' });
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

exports.assigncourse = async(req,res)=>{
    try{
        const token = req.body.token;
        if(!token)throw 'authentication failed';
        const decoded_id = await promisify(jwt.verify)(token,'iamadumb');
        const currprofessor = professor.findById(decoded_id);
        if(!currprofessor)throw 'authentication failed';
        const courseid = req.body.courseid;
        const studentemail = req.body.studentemail;

        if(!courseid||!studentemail)throw 'Incomplete data';
        const currcourse = await course.findOne({coursecode:courseid});
        const currstudent = await student.findOne({email:studentemail});
        if(!currcourse||!currstudent)throw 'wrong data';
        currstudent.course.push({name:currcourse.name,branch:currcourse.branch,coursecode:currcourse.coursecode});
<<<<<<< HEAD
        await currcourse.enrolledstudent.push({name:currstudent.name,email:currstudent.email,roll:currstudent.rollno});
=======
        await currcourse.enrolledstudent.push({name:currstudent.name,email:currstudent.email,roll:currstudent.roll});
>>>>>>> 191b84ff1264b3128540044b5f264518c11719a6
        currcourse.save();
        currstudent.save();
        
        res.json({
            status:"success",
            message:`course added to ${currstudent.name}`
        })
    }
    catch(err){
        res.json({
            status:"error",
            message:err
        })
    }
}

exports.newassignment = async(req,res)=>{
    try{
        const token = req.body.token;
        const name = req.body.name;
        const coursecode = req.body.coursecode;
        const description = req.body.description;
        if(!token||!name||!coursecode||!description)throw 'invalid request';
        const decoded_id = await promisify(jwt.verify)(token,'iamadumb');
        const currprofessor = professor.findById(decoded_id);
        if(!currprofessor)throw 'authentication failed';
        const currcourse = await course.findOne({coursecode:coursecode});
        if(!currcourse)throw 'invalid request';
        const currassignment = await assignment.create({name:name,description:description});
        currcourse.assignment.push(currassignment._id);
        currcourse.save();

        res.json({
            status:"success",
            message:"currcourse"
        });
    }
    catch(err){
        res.json({
            status:"error",
            message:err
        })
    }
}

exports.givemarks = async(req,res)=>{
    try{
        const textid = req.body.textid;
        const marks = req.body.marks;
        const currtext = await textdata.findById(textid);
        if(!currtext)throw 'invalid request';
        currtext.marks=marks;
        currtext.save();
        res.json({
            status:"success",
            message:currtext
        })
    }
    catch(err){
        res.json({
            status:"error",
            message:err
        })
    }
}