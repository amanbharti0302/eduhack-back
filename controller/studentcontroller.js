const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const vision = require('@google-cloud/vision');
dotenv.config({ path: '../config.env' });
const multer = require('multer');
const { promisify } = require('util');
const fs = require('fs');
const { error } = require("console");
var convertapi = require('convertapi')(`WWBieKt9OWuKAGZL`);

const textdata = require('../schema/textshema');
const course = require('../schema/courseschema');
const student = require("../schema/studentschema");
const assignment = require('../schema/assignmentschema');
const { nextTick } = require('process');

exports.newstudent = async (req, res) => {
    try {
        const newstudent = await student.create(req.body);
        res.send(newstudent);
    }
    catch (err) {
        res.send(err);
    }
}

exports.getstudent = async(req,res)=>{
    try{
        const token = await req.body.token;
        if(!token)throw 'authentication failed';
        const decoded_id = await promisify(jwt.verify)(token, 'iamadumb');
        const currstudent =await student.findById(decoded_id.id);
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
        const token = jwt.sign({ id },'iamadumb', { expiresIn:'90d' });
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

//MyFiles
exports.myfiles = async (req, res) => {
    try {
        console.log('okk');
        const name = await req.body.name;
        const rollno = await req.body.rollno;
        const email = await req.body.email;
        const assignmentid = await req.body.assignmentid;
        const coursecode = await req.body.coursecode;
        const filename = await req.files[0].originalname;
        const filepath = await req.files[0].path;
        const filelocation = `${__dirname}/../${filepath}.pdf`;

        fs.renameSync(`${__dirname}/../${filepath}`, filelocation, (err) => { if (err) console.log(err); })
        
        var currassignment = await assignment.findById(assignmentid);
        var data;
        //console.log(currassignment);

        await convertapi.convert('extract-images', { File: `./${filepath}.pdf` }, 'pdf').then(async (result)=> {
            return result.saveFiles(`${__dirname}/../img`);
        }).then(async (file) => {
            data = await file;
        }).catch((e) => {
            // console.log('find');
            fs.unlinkSync(filelocation);
            res.json({
                status: "error",
                message: e
            })
        })

        var finaltext="ll";
        var newtext = await textdata.create({ name: name, rollno: rollno, email: email,text: finaltext,coursecode:coursecode,filelocation:filepath,filename:filename});
        
        await currassignment.student.push({rollno:rollno,id:newtext._id});
        currassignment.save();

        await data.map(async (el) => {
                const clientOptions = { apiEndpoint: 'eu-vision.googleapis.com' };
                const client = new vision.ImageAnnotatorClient();
                const [result] = await client.textDetection(el);
                const fullTextAnnotation =await result.fullTextAnnotation;
                fs.unlinkSync(el);
                if(fullTextAnnotation!=null){
                    finaltext =finaltext + fullTextAnnotation.text;
                    newtext.text =finaltext;
                    await newtext.save();
                }
        })
        
        res.json({
            message: "hello",
            status: "success"
        })

    }
    catch (err) {
        console.log('error');
        console.log(err);
        res.json({
            status: "error",
            message: err
        })
    }
}


//Assignment
exports.assignment = async (req, res) => {
    try {
        const ass = req.body.ass;
        if (!ass) throw 'Invalid request';
        const currcourse = await course.findOne({ coursecode: ass });
        if (!currcourse) throw 'Invalid course';
        res.json({
            status: "success",
            message: currcourse.assignment
        })
    }
    catch (err) {
        res.json({
            status: "error",
            message: err
        })
    }
}

exports.getassignmentdetail = async(req,res)=>{
    try{
        const id = req.body.id;
        const currassignment =await assignment.findById(id);
        res.json({
            status:"success",
            message:currassignment
        })
    }
    catch(err){
        res.json({
            status: "error",
            message: err
        })
    }
}

exports.dwnldfile = async(req,res)=>{
    try{
        const id = req.params.id;
        const currtext =await textdata.findOne({_id:id});
        if(!currtext)throw 'textdata not found';
        const filelocation =currtext.filelocation;
        var file = fs.readFileSync(`${__dirname}/../${filelocation}.pdf`);
        res.write(file, 'binary');
        res.end();
    }
    catch(err){
        res.json({
            status: "error",
            message: err
        })
    }
}

exports.gettext = async(req,res)=>{
    try{
        const id = req.body.textid;
        const currtext = await textdata.findById(id);
        if(!currtext)throw'invalid';
        
        res.json({
            status: "success",
            message: currtext
        })
    }
    catch(err){
        res.json({
            status: "error",
            message: err
        })
    }
}