const express = require('express');
const router = express.Router();
const { authMiddleware, authUserMiddleware } = require('../middleware/authMiddelware');
const EmployeeController = require('../controllers/EmployeeController');
const upload = require('../middleware/uploadMiddleware');

router.post('/create-employee', upload.single('avatar'), EmployeeController.createEmployee);
router.put('/update-employee/:id', upload.single('avatar'), EmployeeController.updateEmployee);
router.delete('/delete-employee/:id', authMiddleware, EmployeeController.deleteEmployee);
router.get('/getAllEmployee', EmployeeController.getAllEmployee);
router.get('/getEmployeeDetail/:id', EmployeeController.getEmployeeDetail);
router.get('/search', authMiddleware, EmployeeController.searchEmployees);
router.get('/statistics', EmployeeController.getStatistics);
router.get('/getEmployeeByUser/:userId', authUserMiddleware, EmployeeController.getEmployeeByUserId);




module.exports = router; 
