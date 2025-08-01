const EmployeeModel = require('../models/EmployeeModel');
const EmployeeService = require('../services/EmployeeService');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const { logger } = require('../logger');

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

// Middleware tự decode token trong controller
const getUserFromToken = (req) => {
  const authHeader = req.headers.token;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    logger.warn('JWT decode failed: ' + err.message);
    return null;
  }
};

const createEmployee = async (req, res) => {
  try {
    const {
      employeeId, fullName, email, phone,
      position, department, salary,
      gender, dateOfBirth, dateOfjoining, username, role
    } = req.body;

    const currentUser = getUserFromToken(req);
    if (!currentUser) {
      logger.warn('Unauthorized attempt to create employee');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    logger.info(`${currentUser.username} is attempting to create employee ${employeeId}`);

    let userRole = currentUser.role;
    if (userRole !== 'admin') {
      const currentEmployee = await EmployeeModel.findOne({ userId: currentUser.id });
      if (!currentEmployee || currentEmployee.role !== 'Trưởng phòng') {
        logger.warn(`Permission denied: ${currentUser.username} is not authorized to create employee`);
        return res.status(403).json({ message: 'Chỉ trưởng phòng hoặc admin mới được tạo nhân viên' });
      }
    }

    if (
      !employeeId || !fullName || !email || !phone || !position ||
      !department || !salary || !gender || !dateOfBirth || !dateOfjoining || !role
    ) {
      logger.warn('Missing required fields when creating employee');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const allowedRoles = ['Trưởng phòng', 'Phó phòng', 'Trưởng bộ phận', 'Tổ trưởng', 'Nhân viên'];
    if (!allowedRoles.includes(role.trim())) {
      logger.warn('Invalid role provided: ' + role);
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existEmployee = await EmployeeModel.findOne({ employeeId });
    if (existEmployee) {
      logger.warn(`Duplicate employeeId: ${employeeId}`);
      return res.status(409).json({ message: 'Employee ID already exists' });
    }

    let userIdToAssign = null;
    if (username) {
      const user = await UserModel.findOne({ username });
      if (!user) {
        logger.warn(`Username not found: ${username}`);
        return res.status(404).json({ message: 'User not found with provided username' });
      }
      userIdToAssign = user._id;
    }

    let avatarPath = null;
    if (req.file && req.file.filename) {
      avatarPath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const result = await EmployeeService.createEmployee({
      employeeId, fullName, email, phone,
      position, department, salary,
      gender, dateOfBirth, dateOfjoining,
      avatar: avatarPath,
      userId: userIdToAssign,
      role
    });

    logger.info(`Employee ${employeeId} created by ${currentUser.username}`);
    return res.status(201).json(result);
  } catch (e) {
    logger.error('Error creating employee: ' + e.message);
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

    const currentUser = getUserFromToken(req);
    if (!currentUser) {
      logger.warn('Unauthorized attempt to update employee');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (currentUser.role !== 'admin') {
      const currentEmployee = await EmployeeModel.findOne({ userId: currentUser.id });
      if (!currentEmployee || currentEmployee.role !== 'Trưởng phòng') {
        logger.warn(`${currentUser.username} tried to update employee without permission`);
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật nhân viên' });
      }
    }

    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      logger.warn(`Employee not found for update: ${id}`);
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.file) {
      data.avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    if (data.role) {
      const allowedRoles = ['Trưởng phòng', 'Phó phòng', 'Trưởng bộ phận', 'Tổ trưởng', 'Nhân viên'];
      if (!allowedRoles.includes(data.role.trim())) {
        logger.warn('Invalid role provided on update: ' + data.role);
        return res.status(400).json({ message: 'Invalid role' });
      }
    }

    if (data.username) {
      const user = await UserModel.findOne({ username: data.username });
      if (!user) {
        logger.warn(`Username not found during update: ${data.username}`);
        return res.status(404).json({ message: 'User not found with provided username' });
      }
      data.userId = user._id;
    }

    const result = await EmployeeService.updateEmployee(id, data);
    logger.info(`${currentUser.username} updated employee ${id}`);
    return res.status(200).json(result);
  } catch (e) {
    logger.error('Error updating employee: ' + e.message);
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
      logger.warn(`Attempt to delete nonexistent employee: ${id}`);
      return res.status(404).json({ message: 'Employee not found' });
    }

    const result = await EmployeeService.deleteEmployee(id);
    logger.info(`Employee deleted: ${id}`);
    return res.status(200).json(result);
  } catch (e) {
    logger.error('Error deleting employee: ' + e.message);
    return res.status(500).json({
      message: 'Error deleting employee',
      error: e.message
    });
  }
};

const getAllEmployee = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = getUserFromToken(req);
    if (!user) {
      logger.warn('Unauthorized attempt to get employee list');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentEmployee = await EmployeeModel.findOne({ userId: user.id });
    if (!currentEmployee && user.role !== 'admin') {
      logger.warn('Employee not found for user: ' + user.username);
      return res.status(404).json({ message: 'Current employee not found' });
    }

    const allEmployees = await EmployeeModel.find();
    const hierarchy = ['Trưởng phòng', 'Phó phòng', 'Trưởng bộ phận', 'Tổ trưởng', 'Nhân viên'];
    const currentIndex = currentEmployee ? hierarchy.indexOf(currentEmployee.role) : -1;

    const filtered = allEmployees.filter((emp) => {
      if (user.role === 'admin') return true;
      if (emp.department !== currentEmployee.department) return false;
      const empIndex = hierarchy.indexOf(emp.role);
      if (emp._id.toString() === currentEmployee._id.toString()) return true;
      return empIndex >= currentIndex;
    });

    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    logger.info(`${user.username} retrieved employee list`);
    return res.status(200).json({
      status: 'success',
      total: filtered.length,
      data: paged,
    });
  } catch (e) {
    logger.error('Error getting employee list: ' + e.message);
    return res.status(500).json({
      message: 'Error getting employee list',
      error: e.message,
    });
  }
};

const getEmployeeDetail = async (req, res) => {
  try {
    const targetId = req.params.id;
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const viewer = await EmployeeModel.findOne({ userId: user.id });
    const target = await EmployeeModel.findById(targetId);
    if (!target) return res.status(404).json({ message: 'Employee not found' });

    if (user.role === 'admin') {
      logger.info(`${user.username} viewed employee ${targetId} (admin)`);
      return res.status(200).json({ data: target });
    }

    if (viewer && viewer._id.toString() === target._id.toString()) {
      logger.info(`${user.username} viewed own profile`);
      return res.status(200).json({ data: target });
    }

    if (!viewer || viewer.department !== target.department) {
      logger.warn(`${user.username} tried to view employee from different department`);
      return res.status(403).json({ message: 'Bạn không có quyền xem nhân viên phòng ban khác' });
    }

    const hierarchy = ['Trưởng phòng', 'Phó phòng', 'Trưởng bộ phận', 'Tổ trưởng', 'Nhân viên'];
    const viewerIndex = hierarchy.indexOf(viewer.role);
    const targetIndex = hierarchy.indexOf(target.role);

    if (targetIndex >= viewerIndex) {
      logger.info(`${user.username} viewed employee ${targetId}`);
      if (viewer.role === 'Trưởng phòng') return res.status(200).json({ data: target });
      const { salary, ...safeData } = target.toObject();
      return res.status(200).json({ data: safeData });
    }

    logger.warn(`${user.username} tried to view higher level employee`);
    return res.status(403).json({ message: 'Bạn không có quyền xem thông tin này' });
  } catch (e) {
    logger.error('Error getting employee detail: ' + e.message);
    return res.status(500).json({
      message: 'Error getting employee detail',
      error: e.message,
    });
  }
};

const searchEmployees = async (req, res) => {
  try {
    const { keyword, department } = req.query;
    const result = await EmployeeService.searchEmployees(keyword, department);
    logger.info(`Search employees by keyword=${keyword} department=${department}`);
    return res.status(200).json(result);
  } catch (e) {
    logger.error('Error searching employees: ' + e.message);
    return res.status(500).json({
      message: 'Error searching employees',
      error: e.message
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    const result = await EmployeeService.getStatistics();
    logger.info('Statistics retrieved');
    return res.status(200).json(result);
  } catch (e) {
    logger.error('Error getting statistics: ' + e.message);
    return res.status(500).json({
      message: 'Error getting statistics',
      error: e.message
    });
  }
};

const getEmployeeByUserId = async (req, res) => {
  try {
    const user = req.user;
    const targetUserId = req.params.userId;

    if (user.role !== 'admin' && user.id !== targetUserId) {
      logger.warn(`${user.username} tried to view another user's employee info`);
      return res.status(403).json({
        message: 'Access denied: You can only view your own info',
      });
    }

    const result = await EmployeeService.getEmployeeByUserId(targetUserId);
    if (result.status === 'ERR') {
      logger.warn(`Employee not found for userId: ${targetUserId}`);
      return res.status(404).json({ message: result.message });
    }

    logger.info(`${user.username} retrieved employee info by userId`);
    return res.status(200).json(result);
  } catch (e) {
    logger.error('Error getting employee by userId: ' + e.message);
    return res.status(500).json({
      message: 'Error getting employee by userId',
      error: e.message,
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
  getStatistics,
  getEmployeeByUserId
};
