const express = require('express');
const studentcontroller = require('../controller/studentcontroller');

const router = express.Router();
router.post('/new', studentcontroller.newstudent);
router.post('/signup', studentcontroller.signup);
router.post('/login', studentcontroller.login);


module.exports = router;