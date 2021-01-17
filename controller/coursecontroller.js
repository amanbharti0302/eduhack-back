const mongoose = require('mongoose');
const course = require('../schema/courseschema');
const courseschema = require('../schema/courseschema');
const assignment = require('../schema/assignmentschema');
const textdata = require('../schema/textshema');

exports.newcourse = async(req,res)=>{
    try{
        const newcourse = await courseschema.create(req.body);
        res.send(newcourse);
    }
    catch(err){
        res.status(500).send(err);
    }
}

exports.getstudents = async(req,res)=>{
    try{
        const coursecode=req.body.coursecode;
        const currcourse = await course.findOne({coursecode:coursecode});
        if(!currcourse)throw 'Invalid course';
        await currcourse.save();
        res.json({
            status:"success",
            message:currcourse.enrolledstudent
        })
    }
    catch(err){
        res.json({
            status:"error",
            message:err
        })        
    }
}

exports.getcourseperformance = async(req,res)=>{
    try{
        const coursecode = req.body.coursecode;
        const currcourse = await course.findOne({coursecode:coursecode});
        var performance = [];
        await Promise.all (currcourse.assignment.map(async(el)=>{
            var result = 0;
            const currassignment = await assignment.findById(el);
            var len = currassignment.student.length;
            
            await Promise.all(currassignment.student.map(async(el2)=>{
                const id = el2.id;
                const currtext = await textdata.findById(id);
                result+=parseInt(currtext.marks);
            }));

            performance.push(result/len);
        }))

        res.json({
            status:"success",
            message:performance
        })
    }
    catch(err){
        res.json({
            status:"error",
            message:err
        })
    }
}