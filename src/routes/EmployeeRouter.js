const express = require('express');
const router = express.Router();
const { authMiddleware, authUserMiddleware } = require('../middleware/authMiddelware');
const EmployeeController = require('../controllers/EmployeeController');

router.post('/create-employee', authMiddleware, EmployeeController.createEmployee);
router.put('/update-employee/:id', authMiddleware, EmployeeController.updateEmployee);
router.delete('/delete-employee/:id', authMiddleware, EmployeeController.deleteEmployee);
router.get('/getAllEmployee', authMiddleware, EmployeeController.getAllEmployee);
router.get('/getEmployeeDetail/:id', authUserMiddleware, EmployeeController.getEmployeeDetail);
router.get('/search', authMiddleware, EmployeeController.searchEmployees);
router.get('/statistics', authMiddleware, EmployeeController.getStatistics);
router.get('/getEmployeeByUser/:userId', authUserMiddleware, EmployeeController.getEmployeeByUserId);




module.exports = router; 
