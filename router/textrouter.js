const router=require('express').Router();
const textcontroller=require('../controller/textcontroller.jsx');

router.post('/assignment-details',textcontroller.handleAssignmentDetails);

module.exports=router;