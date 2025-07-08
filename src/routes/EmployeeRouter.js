const express = require('express');
const router = express.Router();
const { authMiddleware, authUserMiddleware } = require('../middleware/authMiddelware');
const EmployeeController = require('../controllers/EmployeeController');
const upload = require('../middleware/uploadMiddleware');

router.post('/create-employee', authMiddleware, upload.single('avatar'), EmployeeController.createEmployee);
router.put('/update-employee/:id', authMiddleware, upload.single('avatar'), EmployeeController.updateEmployee);
router.delete('/delete-employee/:id', authMiddleware, EmployeeController.deleteEmployee);
router.get('/getAllEmployee', EmployeeController.getAllEmployee);
router.get('/getEmployeeDetail/:id', authUserMiddleware, EmployeeController.getEmployeeDetail);
router.get('/search', authMiddleware, EmployeeController.searchEmployees);
router.get('/statistics', authMiddleware, EmployeeController.getStatistics);
router.get('/getEmployeeByUser/:userId', authUserMiddleware, EmployeeController.getEmployeeByUserId);




module.exports = router; 
