const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwtService = require('./jwtService');
const { logger } = require('../logger');

const createUser = async (newUser) => {
  try {
    const { username, password, role } = newUser;
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await UserModel.create({
      username,
      password: hashedPassword,
      role
    });

    logger.info(`User created: ${createdUser._id}`);
    return {
      status: 'success',
      message: 'User created successfully',
      data: createdUser
    };
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

const getUserByEmployeeId = async (employeeId) => {
  try {
    return await UserModel.findOne({ employeeId });
  } catch (error) {
    logger.error('Error finding user by employeeId:', error);
    throw error;
  }
};

const getUserByUsername = async (username) => {
  try {
    return await UserModel.findOne({ username });
  } catch (error) {
    logger.error('Error finding user by username:', error);
    throw error;
  }
};

const comparePassword = async (inputPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(inputPassword, hashedPassword);
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    throw error;
  }
};

const loginUserWithToken = async (username, password) => {
  try {
    const user = await getUserByUsername(username);
    if (!user) throw new Error('User not found');

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error('Incorrect password');

    const payload = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    const access_token = jwtService.generateAccessToken(payload);
    const refresh_token = jwtService.generateRefreshToken(payload);

    const { password: _, ...userSafe } = user.toObject();

    logger.info(`User login successful: ${user.username}`);
    return {
      status: 'success',
      message: 'Login successful',
      access_token,
      refresh_token,
      user: userSafe
    };
  } catch (error) {
    logger.error('Login failed:', error.message);
    throw error;
  }
};

const updateUser = async (userId, data) => {
  try {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return {
        status: 'ERR',
        message: 'User not found'
      };
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, data, { new: true });
    logger.info(`User updated: ${userId}`);
    return {
      status: 'success',
      message: 'User updated successfully',
      data: updatedUser
    };
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return {
        status: 'ERR',
        message: 'User not found'
      };
    }

    await UserModel.findByIdAndDelete(userId);
    logger.info(`User deleted: ${userId}`);
    return {
      status: 'success',
      message: 'User deleted successfully'
    };
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw error;
  }
};

const getAllUser = async () => {
  try {
    const allUsers = await UserModel.find({});
    return {
      status: 'success',
      data: allUsers
    };
  } catch (error) {
    logger.error('Error retrieving all users:', error);
    throw error;
  }
};

const getUserDetail = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return {
        status: 'ERR',
        message: 'User not found'
      };
    }

    return {
      status: 'success',
      data: user
    };
  } catch (error) {
    logger.error('Error retrieving user detail:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmployeeId,
  getUserByUsername,
  comparePassword,
  loginUserWithToken,
  updateUser,
  deleteUser,
  getAllUser,
  getUserDetail
};
