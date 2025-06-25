const express = require('express');
const router = express.Router();
const { authMiddleware, authUserMiddleware } = require('../middleware/authMiddelware');
const EmployeeController = require('../controllers/EmployeeController');

router.post('/create-employee', authMiddleware, EmployeeController.createEmployee);
router.put('/update-employee/:id', authMiddleware, EmployeeController.updateEmployee);
router.delete('/delete-employee/:id', authMiddleware, EmployeeController.deleteEmployee);
router.get('/getAllEmployee', EmployeeController.getAllEmployee);
router.get('/getEmployeeDetail/:id', authUserMiddleware, EmployeeController.getEmployeeDetail);

module.exports = router; 
