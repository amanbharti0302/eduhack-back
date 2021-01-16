const router=require('express').Router();
const coursecontroller=require('../controller/coursecontroller');

router.post('/new',coursecontroller.newcourse);

module.exports=router;