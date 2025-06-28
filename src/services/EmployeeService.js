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

const getAllEmployee = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
        EmployeeModel.find({})
            .select('-__v')
            .skip(skip)
            .limit(limit),
        EmployeeModel.countDocuments()
    ]);

    return {
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
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

const searchEmployees = async (keyword, department) => {
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
};

const getStatistics = async () => {
    const byDepartment = await EmployeeModel.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const byGender = await EmployeeModel.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    return {
        status: 'success',
        data: {
            byDepartment,
            byGender
        }
    };
};

const getEmployeeByUserId = async (userId) => {
  const employee = await EmployeeModel.findOne({ userId });
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
    getEmployeeDetail,
    searchEmployees,
    getStatistics,
    getEmployeeByUserId
};
