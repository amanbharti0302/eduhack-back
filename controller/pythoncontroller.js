const {spawn}=require('child_process');
const fs=require('fs');
//const path=require('path');

const handlePython=(path,req,res)=>{
	let processed=false;
	//const model_path=path.resolve('../mlstuff/model.py');
	const child=spawn('python',[path,JSON.stringify(req.body)]);

	child.stdout.on('data',(data)=>{
		try{
			let model_output=data.toString();
			model_output=model_output.replace(/'/g,'"');
			processed=true;
			model_output=JSON.parse(model_output);
			return res.json(model_output);
		}
		catch(err){
			res.status(500).json(`this is bad => error: ${err}`);
		}
	})
	child.stderr.on('data',(data)=>{
		//console.error(data.toString());
		processed=true;
		res.json(data.toString());
	});
	child.on('exit',(code)=>{
		console.log(`Child exited with code ${code}`);
		if(!processed)
			res.status(500).json(`this is bad => code: ${code}`);
	});

}
const handleDendroImage=(path,req,res)=>{
	fs.readFile(path,(err,data)=>{
		if(err){
			console.log(err);
			res.json(err);
		}
		else{
			res.json(data.toString('base64'));
		}
	});
	//res.download(path);
}

module.exports={
	handlePython: handlePython,
	handleDendroImage: handleDendroImage
}