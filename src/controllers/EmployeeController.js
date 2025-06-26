const EmployeeModel = require('../models/EmployeeModel');
const EmployeeService = require('../services/EmployeeService');
const UserModel = require('../models/UserModel');

const createEmployee = async (req, res) => {
    try {
        console.log('Creating employee with data:', req.body);
        const { 
            employeeId, fullName, email, phone, 
            position, department, salary,
            gender, dateOfBirth, dateOfjoining, avatar, username 
        } = req.body;

        if (!employeeId || !fullName || !email || !phone || 
            !position || !department || !salary ||
            !gender || !dateOfBirth || !dateOfjoining || !avatar) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existEmployee = await EmployeeModel.findOne({ employeeId });
        if (existEmployee) {
            return res.status(409).json({ message: 'Employee ID already exists' });
        }

        const currentUser = req.user;
        let userIdToAssign;

        if (currentUser.role === 'admin') {
            if (!username) {
                return res.status(400).json({ message: 'Admin must provide username to assign employee' });
            }

            const targetUser = await UserModel.findOne({ username });
            if (!targetUser) {
                return res.status(404).json({ message: 'User not found with provided username' });
            }

            userIdToAssign = targetUser._id;
        } else {
            userIdToAssign = currentUser.id;
        }

        const result = await EmployeeService.createEmployee({
            employeeId, fullName, email, phone,
            position, department, salary,
            gender, dateOfBirth, dateOfjoining, avatar,
            userId: userIdToAssign
        });

        return res.status(201).json(result);
    } catch (e) {
        return res.status(500).json({
            message: 'Error creating employee',
            error: e.message
        });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const employee = await EmployeeModel.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const result = await EmployeeService.updateEmployee(id, data);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: 'Error updating employee',
            error: e.message
        });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const id = req.params.id;

        const employee = await EmployeeModel.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const result = await EmployeeService.deleteEmployee(id);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: 'Error deleting employee',
            error: e.message
        });
    }
};

const getAllEmployee = async (req, res) => {
    try {
        const user = req.user;

        const result = await EmployeeService.getAllEmployee();
        return res.status(200).json({ data: result });
    } catch (e) {
        return res.status(500).json({
            message: 'Error getting employee list',
            error: e.message
        });
    }
};

const getEmployeeDetail = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const user = req.user;

        const employee = await EmployeeModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        if (user.role !== 'admin' && employee.userId.toString() !== user.id) {
            return res.status(403).json({
                message: 'Access denied: You can only view your own profile'
            });
        }

        return res.status(200).json({ data: employee });
    } catch (e) {
        return res.status(500).json({
            message: 'Error getting employee detail',
            error: e.message
        });
    }
};

const searchEmployees = async (req, res) => {
    try {
        const { keyword, department } = req.query;
        const result = await EmployeeService.searchEmployees(keyword, department);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: 'Error searching employees',
            error: e.message
        });
    }
};

const getStatistics = async (req, res) => {
    try {
        const result = await EmployeeService.getStatistics();
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: 'Error getting statistics',
            error: e.message
        });
    }
};


module.exports = {
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getAllEmployee,
    getEmployeeDetail,
    searchEmployees,
    getStatistics
};
