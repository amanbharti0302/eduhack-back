const express = require('express');
const router = express.Router();
const admincontroller = require('../controller/admincontroler');
const { route } = require('./studentrouter');

router.post('/newteacher', admincontroller.newteacher);
router.post('/newstudent', admincontroller.newstudent);
router.post('/coursetoprof',admincontroller.addcoursetoprof);
module.exports = router;