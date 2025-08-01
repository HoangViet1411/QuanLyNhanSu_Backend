const EmployeeModel = require('../models/EmployeeModel');
const { logger } = require('../logger');

const createEmployee = async (newEmployee) => {
  try {
    const createdEmployee = await EmployeeModel.create(newEmployee);
    logger.info('Employee created:', createdEmployee._id);
    return {
      status: 'success',
      message: 'Employee created successfully',
      data: createdEmployee
    };
  } catch (error) {
    logger.error('Error creating employee:', error);
    throw error;
  }
};

const updateEmployee = async (employeeId, data) => {
  try {
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return { status: 'ERR', message: 'Employee not found' };
    }

    const updated = await EmployeeModel.findByIdAndUpdate(employeeId, data, { new: true });
    logger.info(`Employee updated: ${employeeId}`);
    return {
      status: 'success',
      message: 'Employee updated successfully',
      data: updated
    };
  } catch (error) {
    logger.error('Error updating employee:', error);
    throw error;
  }
};

const deleteEmployee = async (employeeId) => {
  try {
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return { status: 'ERR', message: 'Employee not found' };
    }

    await EmployeeModel.findByIdAndDelete(employeeId);
    logger.info(`Employee deleted: ${employeeId}`);
    return {
      status: 'success',
      message: 'Employee deleted successfully'
    };
  } catch (error) {
    logger.error('Error deleting employee:', error);
    throw error;
  }
};

const getAllEmployee = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      EmployeeModel.find({}).select('-__v').skip(skip).limit(limit),
      EmployeeModel.countDocuments()
    ]);

    return {
      status: 'success',
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: employees
    };
  } catch (error) {
    logger.error('Error getting all employees:', error);
    throw error;
  }
};

const getEmployeeDetail = async (employeeId) => {
  try {
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return { status: 'ERR', message: 'Employee not found' };
    }

    return {
      status: 'success',
      data: employee
    };
  } catch (error) {
    logger.error('Error getting employee detail:', error);
    throw error;
  }
};

const searchEmployees = async (keyword, department) => {
  try {
    let query = {};

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [
        { fullName: { $regex: regex } },
        { email: { $regex: regex } }
      ];
    }

    if (department) {
      query.department = department;
    }

    const employees = await EmployeeModel.find(query).select('-__v');
    return {
      status: 'success',
      data: employees
    };
  } catch (error) {
    logger.error('Error searching employees:', error);
    throw error;
  }
};

const getStatistics = async () => {
  try {
    const byDepartment = await EmployeeModel.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const byGender = await EmployeeModel.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    return {
      status: 'success',
      data: { byDepartment, byGender }
    };
  } catch (error) {
    logger.error('Error getting statistics:', error);
    throw error;
  }
};

const getEmployeeByUserId = async (userId) => {
  try {
    const employee = await EmployeeModel.findOne({ userId });
    if (!employee) {
      return { status: 'ERR', message: 'Employee not found' };
    }

    return {
      status: 'success',
      data: employee
    };
  } catch (error) {
    logger.error('Error getting employee by userId:', error);
    throw error;
  }
};

module.exports = {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployee,
  getEmployeeDetail,
  searchEmployees,
  getStatistics,
  getEmployeeByUserId
};
