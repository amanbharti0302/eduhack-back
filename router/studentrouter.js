const express = require('express');
const multer = require('multer');
const studentcontroller = require('../controller/studentcontroller');
const router = express.Router();


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


router.post('/new', studentcontroller.newstudent);
router.post('/signup', studentcontroller.signup);
router.post('/login', studentcontroller.login);
router.post('/assignment', studentcontroller.assignment);
router.post('/getstudent',studentcontroller.getstudent);
router.post('/myfiles',upload.any('pdf'),studentcontroller.myfiles);
router.post('/getassignment',studentcontroller.getassignmentdetail);
router.post('/gettext',studentcontroller.gettext);
router.get('/dwnldfile/:id',studentcontroller.dwnldfile);

//only check
module.exports = router;