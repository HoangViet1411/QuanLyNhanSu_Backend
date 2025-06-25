const EmployeeService = require('../services/EmployeeService');
const EmployeeModel = require('../models/EmployeeModel');
const UserModel = require('../models/UserModel');

const createEmployee = async (req, res) => {
    try {
        const body = req.body;
        const currentUser = req.user;

        const requiredFields = [
            'employeeId', 'fullName', 'email', 'phone',
            'position', 'department', 'salary',
            'gender', 'dateOfBirth', 'dateOfjoining', 'avatar'
        ];
        const missing = requiredFields.filter(field => !body[field]);
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
        }

        // Kiểm tra employeeId trùng
        const exists = await EmployeeModel.findOne({ employeeId: body.employeeId });
        if (exists) {
            return res.status(409).json({ message: 'Employee ID already exists' });
        }

        let userIdToAssign;

        if (currentUser.role === 'admin') {
            if (!body.username) {
                return res.status(400).json({ message: 'Admin must provide username to assign user' });
            }

            const targetUser = await UserModel.findOne({ username: body.username });
            if (!targetUser) {
                return res.status(404).json({ message: 'User not found with provided username' });
            }

            userIdToAssign = targetUser._id;
        } else {
            userIdToAssign = currentUser.id;
        }

        const result = await EmployeeService.createEmployee({
            ...body,
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
        const user = req.user;

        const employee = await EmployeeModel.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }


        const result = await EmployeeService.updateEmployee(id, req.body);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ message: 'Update failed', error: e.message });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;

        const employee = await EmployeeModel.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const result = await EmployeeService.deleteEmployee(id);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ message: 'Delete failed', error: e.message });
    }
};

const getAllEmployee = async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can view all employees' });
        }

        const result = await EmployeeService.getAllEmployee();
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ message: 'Get failed', error: e.message });
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

        return res.status(200).json({
            status: 'success',
            data: employee
        });
    } catch (e) {
        return res.status(500).json({ message: 'Error getting employee detail', error: e.message });
    }
};

module.exports = {
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getAllEmployee,
    getEmployeeDetail
};
