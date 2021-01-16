const mongoose = require('mongoose');
const courseschema = require('../schema/courseschema');

exports.newcourse = async(req,res)=>{
    try{
        const newcourse = await courseschema.create(req.body);
        res.send(newcourse);
    }
    catch(err){
        res.status(500).send(err);
    }
}