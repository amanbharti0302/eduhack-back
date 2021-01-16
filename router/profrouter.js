const profcontroller = require('../controller/profcontroller');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const professor = require('../schema/profschema');


router.post('/signup', profcontroller.signup);
router.post('/login', profcontroller.login);
router.post('/new', profcontroller.newprofessor);

router.post('/getteacher', profcontroller.getteacher);

module.exports = router;