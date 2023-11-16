const express = require('express');
const router = express();
const userController = require('../controllers/userController');

// create, find, update
router.get('/', userController.view);
router.post('/', userController.find);
router.get('/imgupload', userController.imgupload);
router.post('/imgupload', userController.saveit);
router.get('/imageview/:id', userController.imgview)
router.get('/uploadnew', userController.upit)



router.get('/adduser', userController.form);
router.post('/adduser', userController.create);
router.get('/edituser/:id', userController.edit);
router.post('/edituser/:id', userController.update);
router.get('/login', userController.login)
router.post('/login', userController.loginn)

router.get('/viewuser/:id', userController.viewall);
router.get('/:id', userController.delete);

// router.get('/logout', userController.logout)


module.exports = router;