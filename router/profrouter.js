const profcontroller = require('../controller/profcontroller');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const professor = require('../schema/profschema');

const multerFilter = (req, file, cb) => {
      if (file.mimetype.startsWith('application/pdf')) {
        file.filename = file.originalname;
        cb(null, true);
  } else {
    cb(('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
    fileFilter: multerFilter,
    dest:'filehandle/'
});

router.post('/signup',profcontroller.signup);
router.post('/login',profcontroller.login);
router.post('/new',profcontroller.newprofessor);
router.post('/assigncourse',profcontroller.assigncourse);
router.post('/newassignment',profcontroller.newassignment);
router.post('/studentreport',upload.any('pdf'),profcontroller.getstudentreport);
router.post('/getteacher',profcontroller.getteacher);
router.post('/givemarks',profcontroller.givemarks);

module.exports = router;