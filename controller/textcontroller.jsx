const {spawn}=require('child_process');
const texts=require('../schema/textshema');
const courses=require('../schema/courseschema');
//const student = require("../schema/studentschema");
const assignment = require('../schema/assignmentschema');

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
                'plagiarism-percentage': 0,
                urls: {}
            }
            plagiarismSave(text_id,model_output);
        }
    })
    child.stderr.on('data',(data)=>{
        processed=true;
        model_output={
            'plagiarism-percentage': 0,
            urls: {}
        }
        plagiarismSave(text_id,model_output);
    });
    child.on('exit',(code)=>{
        console.log(`Child exited with code ${code}`);
        if(!processed){
            model_output={
                'plagiarism-percentage': 0,
                urls: {}
            }
            plagiarismSave(text_id,model_output);
        }
    });
}

const handleAssignmentDetails=async(req,res)=>{
    //plagiarismcheck("17","Digital image processing is the use of a digital .Wild is a 2014 American biographical adventure drama film directed by Jean-Marc Vallée. Nick Hornby's screenplay is based on Cheryl Strayed's 2012 memoir Wild: From Lost to Found on the Pacific Crest Trail.")
	//console.log(out);
    try{
		const {rollno,coursecode}=req.body;
		let output=[];
        const currcourse=await courses.findOne({coursecode: coursecode});
        if (!currcourse)
        	throw "Invalid course";
        let name="",assign_details,text_details;
        for(let i=0;i<currcourse.enrolledstudent.length;i++)
            if(currcourse.enrolledstudent[i].roll===rollno){
                name=currcourse.enrolledstudent[i].name;
                break;
            }
        if(name==="")
            throw "Student isn't enrolled";
        for(let i=0;i<currcourse.assignment.length;i++){
            assign_details=await assignment.findById(currcourse.assignment[i]);
            output.push({
                assig_name: assign_details.name,
                assign_date: assign_details.date,
                submit: 'not yet'
            });
            for(let j=0;j<assign_details.student.length;j++){
                if(assign_details.student[j].rollno==rollno){
                    text_details=await texts.findById(assign_details.student[j].id);
                    output[i].submit="yes";
                    if(text_details.plagiarismcheck==="pending"){
                        text_details.plagiarismcheck="processing";
                        text_details.save();
                        output[i].plagiarismcheck="processing";
                        plagiarismCheck(rollno,text_details.text,text_details._id);
                    }
                    else if(text_details.plagiarismcheck!=="complete")
                        output[i].plagiarismcheck="processing";
                    else
                        output[i].plagiarismcheck="complete";
                    output[i].plagiarism=text_details.plagiarism;
                    break;
                }
            }
        }
		res.json(output);
	}
	catch(err){
		res.status(500).json(err);
	}
}


module.exports={
    plagiarismCheck: plagiarismCheck,
	handleAssignmentDetails: handleAssignmentDetails
}