const EmployeeModel = require('../models/EmployeeModel');

const createEmployee = async (newEmployee) => {
    const createdEmployee = await EmployeeModel.create(newEmployee);
    return {
        status: 'success',
        message: 'Employee created successfully',
        data: createdEmployee
    };
};

const updateEmployee = async (employeeId, data) => {
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
        return { status: 'ERR', message: 'Employee not found' };
    }

    const updated = await EmployeeModel.findByIdAndUpdate(employeeId, data, { new: true });
    return {
        status: 'success',
        message: 'Employee updated successfully',
        data: updated
    };
};

const deleteEmployee = async (employeeId) => {
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
        return { status: 'ERR', message: 'Employee not found' };
    }

    await EmployeeModel.findByIdAndDelete(employeeId);
    return {
        status: 'success',
        message: 'Employee deleted successfully'
    };
};

const getAllEmployee = async () => {
    const employees = await EmployeeModel.find({}).select('-__v');
    return {
        status: 'success',
        data: employees
    };
};

const getEmployeeDetail = async (employeeId) => {
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
        return { status: 'ERR', message: 'Employee not found' };
    }

    return {
        status: 'success',
        data: employee
    };
};

module.exports = {
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getAllEmployee,
    getEmployeeDetail
};
