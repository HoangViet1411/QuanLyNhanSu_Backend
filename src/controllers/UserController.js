const User = require('../models/UserModel');
const UserService = require('../services/UserService');
const jwtService = require('../services/jwtService');
const bcrypt = require('bcrypt');
const { logger } = require('../logger');

const createUser = async (req, res) => {
  try {
    logger.info('Creating user with data: ' + JSON.stringify(req.body));
    const { username, password, role, confirmPassword } = req.body;

    if (!username || !password || !role || !confirmPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    const existingUser = await UserService.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Username already exists',
      });
    }

    const result = await UserService.createUser(req.body);
    return res.status(201).json(result);
  } catch (e) {
    logger.error('Error creating user: ' + e.message);
    return res.status(500).json({
      message: 'Error creating user',
      error: e.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    logger.info('Logging in with data: ' + JSON.stringify(req.body));
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Missing username or password' });
    }

    const result = await UserService.loginUserWithToken(username, password);
    return res.status(200).json(result);
  } catch (e) {
    logger.error('Login failed: ' + e.message);
    return res.status(401).json({
      message: 'Username or password is incorrect',
      error: e.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    if (!userId) {
      return res.status(400).json({ status: 'ERR', message: 'User ID is required' });
    }

    if (data.password) {
      if (!data.confirmPassword || data.password !== data.confirmPassword) {
        return res.status(400).json({ status: 'ERR', message: 'Mật khẩu xác nhận không khớp' });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
      delete data.confirmPassword;
    }

    const result = await UserService.updateUser(userId, data);
    return res.status(200).json({ data: result });
  } catch (e) {
    logger.error('Error updating user: ' + e.message);
    return res.status(500).json({
      message: 'Error updating user',
      error: e.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ status: 'ERR', message: 'User ID is required' });
    }

    logger.info('Deleting userId: ' + userId);
    const result = await UserService.deleteUser(userId);
    return res.status(200).json({ data: result });
  } catch (e) {
    logger.error('Error deleting user: ' + e.message);
    return res.status(500).json({
      message: 'Error deleting user',
      error: e.message,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const result = await UserService.getAllUser();
    return res.status(200).json(result);
  } catch (e) {
    logger.error('Error getting all users: ' + e.message);
    return res.status(500).json({
      message: 'Error getting user data',
      error: e.message,
    });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ status: 'ERR', message: 'User ID is required' });
    }

    logger.info('Getting user detail for ID: ' + userId);
    const result = await UserService.getUserDetail(userId);
    return res.status(200).json({ data: result });
  } catch (e) {
    logger.error('Error getting user detail: ' + e.message);
    return res.status(500).json({
      message: 'Error getting user detail',
      error: e.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.headers.token.split(' ')[1];
    if (!token) {
      return res.status(400).json({ status: 'ERR', message: 'Token is required' });
    }

    logger.info('Refreshing token: ' + token);
    const result = await jwtService.refreshTokenJwtService(token);
    return res.status(200).json({ result });
  } catch (e) {
    logger.error('Error refreshing token: ' + e.message);
    return res.status(500).json({ error: e.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getUserDetail,
  refreshToken,
};
