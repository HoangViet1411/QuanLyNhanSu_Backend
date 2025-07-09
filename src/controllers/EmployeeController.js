const EmployeeModel = require('../models/EmployeeModel');
const EmployeeService = require('../services/EmployeeService');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_ACCESS_SECRET;


// Middleware tự decode token trong controller
const getUserFromToken = (req) => {
  const authHeader = req.headers.token;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return decoded;
  } catch (err) {
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

    // Kiểm tra người gửi request
    const currentUser = getUserFromToken(req);

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let userRole = currentUser.role;

    // Nếu không phải admin → kiểm tra xem có phải trưởng phòng không
    if (userRole !== 'admin') {
      const currentEmployee = await EmployeeModel.findOne({ userId: currentUser.id });
      if (!currentEmployee || currentEmployee.role !== 'Trưởng phòng') {
        return res.status(403).json({ message: 'Chỉ trưởng phòng hoặc admin mới được tạo nhân viên' });
      }
    }

    // Kiểm tra các trường bắt buộc
    if (
      !employeeId || !fullName || !email || !phone || !position ||
      !department || !salary || !gender || !dateOfBirth || !dateOfjoining || !req.file || !role
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Kiểm tra role hợp lệ
    const allowedRoles = ['Trưởng phòng', 'Phó phòng', 'Trưởng bộ phận', 'Tổ trưởng', 'Nhân viên'];
    if (!allowedRoles.includes(role.trim())) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Kiểm tra trùng employeeId
    const existEmployee = await EmployeeModel.findOne({ employeeId });
    if (existEmployee) {
      return res.status(409).json({ message: 'Employee ID already exists' });
    }

    // Gán userId nếu có username
    let userIdToAssign = null;
    if (username) {
      const user = await UserModel.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found with provided username' });
      }
      userIdToAssign = user._id;
    }

    const avatarPath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const result = await EmployeeService.createEmployee({
      employeeId, fullName, email, phone,
      position, department, salary,
      gender, dateOfBirth, dateOfjoining,
      avatar: avatarPath,
      userId: userIdToAssign,
      role
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

    //  Lấy user từ token
    const currentUser = getUserFromToken(req);
    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    //  Chỉ admin hoặc trưởng phòng mới được update
    if (currentUser.role !== 'admin') {
      const currentEmployee = await EmployeeModel.findOne({ userId: currentUser.id });
      if (!currentEmployee || currentEmployee.role !== 'Trưởng phòng') {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật nhân viên' });
      }
    }

    //  Kiểm tra employee tồn tại
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    //  Nếu có avatar mới
    if (req.file) {
      data.avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    //  Nếu có cập nhật role
    if (data.role) {
      const allowedRoles = ['Trưởng phòng', 'Phó phòng', 'Trưởng bộ phận', 'Tổ trưởng', 'Nhân viên'];
      if (!allowedRoles.includes(data.role.trim())) {
        return res.status(400).json({ message: 'Invalid role' });
      }
    }

    // Gán userId nếu có truyền username
    let userIdToAssign = employee.userId; // giữ nguyên nếu không đổi
    if (data.username) {
      const user = await UserModel.findOne({ username: data.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found with provided username' });
    }
    data.userId = user._id;
    }


    //  Cập nhật
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const currentEmployee = await EmployeeModel.findOne({ userId: user.id });
    if (!currentEmployee && user.role !== 'admin') {
      return res.status(404).json({ message: 'Current employee not found' });
    }

    const allEmployees = await EmployeeModel.find();
    const hierarchy = ['Trưởng phòng', 'Phó phòng', 'Trưởng bộ phận', 'Tổ trưởng', 'Nhân viên'];
    const currentIndex = currentEmployee ? hierarchy.indexOf(currentEmployee.role) : -1;

    const filtered = allEmployees.filter((emp) => {
      // Admin thấy tất cả
      if (user.role === 'admin') return true;

      // Khác phòng ban → không thấy
      if (emp.department !== currentEmployee.department) return false;

      const empIndex = hierarchy.indexOf(emp.role);

      // Cho xem chính mình
      if (emp._id.toString() === currentEmployee._id.toString()) return true;

      // Cho xem người cùng cấp hoặc thấp hơn
      return empIndex >= currentIndex;
    });

    // Phân trang
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return res.status(200).json({
      status: 'success',
      total: filtered.length,
      data: paged,
    });
  } catch (e) {
    return res.status(500).json({
      message: 'Error getting employee list',
      error: e.message,
    });
  }
};

module.exports = {
  getAllEmployee
};



const getEmployeeDetail = async (req, res) => {
  try {
    const targetId = req.params.id;
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const viewer = await EmployeeModel.findOne({ userId: user.id });
    const target = await EmployeeModel.findById(targetId);
    if (!target) return res.status(404).json({ message: 'Employee not found' });

    //  Nếu là admin → xem full
    if (user.role === 'admin') {
      return res.status(200).json({ data: target });
    }

    //  Nếu xem chính mình → cho xem full
    if (viewer && viewer._id.toString() === target._id.toString()) {
      return res.status(200).json({ data: target });
    }

    //  Cấm xem khác phòng ban
    if (!viewer || viewer.department !== target.department) {
      return res.status(403).json({ message: 'Bạn không có quyền xem nhân viên phòng ban khác' });
    }

    //  Phân quyền theo cấp bậc
    const hierarchy = ['Trưởng phòng', 'Phó phòng', 'Trưởng bộ phận', 'Tổ trưởng', 'Nhân viên'];
    const viewerIndex = hierarchy.indexOf(viewer.role);
    const targetIndex = hierarchy.indexOf(target.role);

    // Nếu cấp dưới → được xem (ẩn lương nếu không phải admin/trưởng phòng)
    if (targetIndex >= viewerIndex) {
      if (viewer.role === 'Trưởng phòng') {
        return res.status(200).json({ data: target });
      } else {
        const { salary, ...safeData } = target.toObject();
        return res.status(200).json({ data: safeData });
      }
    }

    //  Không xem được người cùng cấp hoặc cao hơn
    return res.status(403).json({ message: 'Bạn không có quyền xem thông tin này' });

  } catch (e) {
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

const getEmployeeByUserId = async (req, res) => {
  try {
    const user = req.user;
    const targetUserId = req.params.userId;

    if (user.role !== 'admin' && user.id !== targetUserId) {
      return res.status(403).json({
        message: 'Access denied: You can only view your own info',
      });
    }

    const result = await EmployeeService.getEmployeeByUserId(targetUserId);
    if (result.status === 'ERR') {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (e) {
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
