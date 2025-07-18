const User = require('../models/UserModel');
const UserService = require('../services/UserService');
const jwtService = require('../services/jwtService');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    try {
        console.log('Creating user with data:', req.body);
        const { username, password, role, confirmPassword } = req.body; 

        if (!username || !password || !role || !confirmPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Password and confirm password do not match' });
        }

        //  Kiểm tra trùng username nếu cần
        const existingUser = await UserService.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'Username already exists'
            });
        }

        const result = await UserService.createUser(req.body);
        return res.status(201).json(result);
    } catch (e) {
        return res.status(500).json({
            message: 'Error creating user',
            error: e.message
        });
    }
};


const loginUser = async (req, res) => {
    try {
        console.log('Logging in with data:', req.body);
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Missing username or password' });
        }

        const result = await UserService.loginUserWithToken(username, password);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(401).json({
            message: 'Username or password is incorrect',
            error: e.message
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

    // Nếu có đổi mật khẩu thì cần xác nhận và mã hóa
    if (data.password) {
      if (!data.confirmPassword || data.password !== data.confirmPassword) {
        return res.status(400).json({ status: 'ERR', message: 'Mật khẩu xác nhận không khớp' });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;

      // Xoá confirmPassword khỏi data nếu không cần lưu
      delete data.confirmPassword;
    }

    const result = await UserService.updateUser(userId, data);

    return res.status(200).json({ data: result });
  } catch (e) {
    return res.status(500).json({
      message: 'Error updating user',
      error: e.message
    });
  }
};


const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({ status: 'ERR' , message: 'User ID is required' });
        }
        console.log("userId", userId);
        const result = await UserService.deleteUser(userId);
        return res.status(200).json({
            data: result
        });

    } catch (e) {
        return res.status(500).json({
            message: 'Error deleting user',
            error: e.message
        });
    }
};

const getAllUser = async (req, res) => {
  try {
    const result = await UserService.getAllUser();
    return res.status(200).json(result);  
  } catch (e) {
    return res.status(500).json({
      message: 'Error getting user data',
      error: e.message
    });
  }
};

const getUserDetail = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({ status: 'ERR' , message: 'User ID is required' });
        }
        console.log("userId", userId);
        const result = await UserService.getUserDetail(userId);
        return res.status(200).json({
            data: result
        });

    } catch (e) {
        return res.status(500).json({
            message: 'Error getting user detail',
            error: e.message
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.headers.token.split(' ')[1];
        if (!token) {
            return res.status(400).json({ status: 'ERR' , message: 'Token is required' });
        }
        console.log("token", token);
        const result = await jwtService.refreshTokenJwtService(token);
        return res.status(200).json({result 
        });

    } catch (e) {
        return res.status(500).json({
            error: e.message
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getUserDetail,
    refreshToken
};
