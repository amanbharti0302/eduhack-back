const {spawn}=require('child_process');
const texts=require('../schema/textshema');
const courses=require('../schema/courseschema');
//const student = require("../schema/studentschema");
const assignments=require('../schema/assignmentschema');

const plagiarismSave=async (text_id,model_output)=>{
    const obj=await texts.findById(text_id);
    //console.log(obj);
    obj.plagiarismcheck="complete";
    obj.plagiarism=model_output;
    obj.save();
}
const plagiarismCheck=async (rollno,text,text_id="6002093c9076510024c98571")=>{
    let processed=false;
    const child=spawn('python',['./python-stuff/plagiarism.py',JSON.stringify({
        text: text
    })]);
    let model_output;
    await child.stdout.on('data',(data)=>{
        try{
            model_output=data.toString();
            model_output=model_output.replace(/'/g,'"');
            processed=true;
            model_output=JSON.parse(model_output);
            plagiarismSave(text_id,model_output);
        }
        catch(err){
            model_output={
                plagiarism_percentage: 0,
                urls: {}
            }
            plagiarismSave(text_id,model_output);
        }
    })
    child.stderr.on('data',(data)=>{
        processed=true;
        model_output={
            plagiarism_percentage: 0,
            urls: {}
        }
        plagiarismSave(text_id,model_output);
    });
    child.on('exit',(code)=>{
        console.log(`Child exited with code ${code}`);
        if(!processed){
            model_output={
                plagiarism_percentage: 0,
                urls: {}
            }
            plagiarismSave(text_id,model_output);
        }
    });
}

const handleStudentDetails=async(req,res)=>{
    //plagiarismcheck("17","Digital image processing is the use of a digital .Wild is a 2014 American biographical adventure drama film directed by Jean-Marc Vallée. Nick Hornby's screenplay is based on Cheryl Strayed's 2012 memoir Wild: From Lost to Found on the Pacific Crest Trail.")
	//console.log(out);
    try{
		const {rollno,coursecode}=req.body;
		let output_assignment=[];
        const currcourse=await courses.findOne({coursecode: coursecode});
        if (!currcourse)
        	throw "Invalid course";
        let name="",branch="",assign_details,text_details;
        for(let i=0;i<currcourse.enrolledstudent.length;i++)
            if(currcourse.enrolledstudent[i].roll===rollno){
                name=currcourse.enrolledstudent[i].name;
                branch=currcourse.branch;
                break;
            }
        if(name==="")
            throw "Enter a valid roll no.";
        for(let i=0;i<currcourse.assignment.length;i++){
            assign_details=await assignments.findById(currcourse.assignment[i]);
            output_assignment.push({
                assign_name: assign_details.name,
                assign_date: assign_details.date,
                submit: 'not yet'
            });
            for(let j=0;j<assign_details.student.length;j++){
                if(assign_details.student[j].rollno==rollno){
                    text_details=await texts.findById(assign_details.student[j].id);
                    output_assignment[i].submit="yes";
                    if(text_details.plagiarismcheck==="pending"){
                        text_details.plagiarismcheck="processing";
                        text_details.save();
                        output_assignment[i].plagiarismcheck="processing";
                        plagiarismCheck(rollno,text_details.text,text_details._id);
                    }
                    else if(text_details.plagiarismcheck!=="complete")
                        output_assignment[i].plagiarismcheck="processing";
                    else
                        output_assignment[i].plagiarismcheck="complete";
                    output_assignment[i].plagiarism=text_details.plagiarism;
                    break;
                }
            }
        }
        const output={};
        output.name=name;
        output.branch=branch;
        output.assignment=output_assignment;
		res.json(output);
	}
	catch(err){
		res.status(500).json(err);
	}
}

const handleAssignmentData=async(req,res)=>{
    try{
        const {coursecode,assignment_id}=req.body;
        let output=[];
        const currcourse=await courses.findOne({coursecode: coursecode});
        if (!currcourse)
            throw "Invalid course";
        for(let i=0;i<currcourse.assignment.length;i++)
            if(currcourse.assignment[i]==assignment_id){
                //console.log(currcourse.assignment[i]);
                const currassignment=await assignments.findById(assignment_id);
                for(let j=0;j<currassignment.student.length;j++){
                    const text_details=await texts.findById(currassignment.student[j].id);
                    //console.log(text_details);
                    output.push({
                        id: text_details.rollno,
                        text: text_details.text
                    })
                }
            }
        //console.log(output);
        res.json(output);
    }
    catch(err){
        res.status(500).json(err);
    }
}
const handleAllAssignments=async(req,res)=>{
    try{
        const {coursecode}=req.body;
        let output=[];
        const currcourse=await courses.findOne({coursecode: coursecode});
        if (!currcourse)
            throw "Invalid course";
        for(let i=0;i<currcourse.assignment.length;i++){
            const currassignment=await assignments.findById(currcourse.assignment[i]);
            output.push({
                assignment_name: currassignment.name,
                assignment_id: currassignment._id
            });
        }
        //console.log(output);
        res.json(output);
    }
    catch(err){
        res.status(500).json(err);
    }
}

module.exports={
	handleStudentDetails: handleStudentDetails,
    handleAssignmentData: handleAssignmentData,
    handleAllAssignments: handleAllAssignments
}