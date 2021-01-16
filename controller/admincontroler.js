const professor = require('../schema/profschema');
const student = require('../schema/studentschema');
const course = require('../schema/courseschema');

exports.newteacher = async (req, res) => {
    try {
        const newprofessor = await professor.create(req.body);
        res.json({
            status: "success",
            message: newprofessor
        })
    }
    catch (err) {
        res.json({
            status: "error",
            message: err
        })
    }
}

exports.newstudent = async (req, res) => {
    try {
        const newug = await student.create(req.body);
        res.json({
            status: "success",
            message: newug
        })
    }
    catch (err) {
        res.json({
            status: "error",
            message: err
        })
    }
}

exports.addcoursetoprof = async(req,res)=>{
    try{
        // console.log(req.body);
        const courseid = req.body.courseid;
        const profemail = req.body.profemail;

        if(!courseid||!profemail)throw 'Incomplete data';
        const currcourse = await course.findOne({coursecode:courseid});
        const currprof = await professor.findOne({email:profemail});
        if(!currcourse||!currprof)throw 'wrong data';
        currprof.course.push({name:currcourse.name,branch:currcourse.branch,coursecode:currcourse.coursecode});
        currprof.save();
        
        res.json({
            status:"success",
            message: currcourse
        })

    }
    catch(err){
        res.json({
            status:"error",
            message:err
        })
    }
}