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

