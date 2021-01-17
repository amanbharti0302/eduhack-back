const router=require('express').Router();
const coursecontroller=require('../controller/coursecontroller');

router.post('/new',coursecontroller.newcourse);
router.post('/getstudents',coursecontroller.getstudents);
router.post('/getcourseperformance',coursecontroller.getcourseperformance);
module.exports=router;