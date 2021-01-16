const router=require('express').Router();
const pythoncontroller=require('../controller/pythoncontroller.js');

router.get('/dendrogram',(req,res)=>pythoncontroller.handleDendroImage('./python-stuff/dendro.png',req,res));
router.post('/clustering',(req,res)=>pythoncontroller.handlePython('./python-stuff/clustering.py',req,res));

//router.post('/plagiarism',pythoncontroller.handlePython);
router.post('/plagiarism',(req,res)=>pythoncontroller.handlePython('./python-stuff/plagiarism.py',req,res));

module.exports=router;