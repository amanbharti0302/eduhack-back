const router=require('express').Router();
const textcontroller=require('../controller/textcontroller.jsx');

router.post('/student-details',textcontroller.handleStudentDetails);
router.post('/assignment-data',textcontroller.handleAssignmentData);
router.post('/all-assignments',textcontroller.handleAllAssignments);

module.exports=router;