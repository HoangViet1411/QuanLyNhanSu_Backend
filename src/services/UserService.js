const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwtService = require('./jwtService');

const createUser = async (newUser) => {
    const { username, password, role, employeeId } = newUser;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await UserModel.create({
        username,
        password: hashedPassword,
        role,
        employeeId
    });

    return {
        status: 'success',
        message: 'User created successfully',
        data: createdUser
    };
};

const getUserByEmployeeId = async (employeeId) => {
    return await UserModel.findOne({ employeeId });
};

const getUserByUsername = async (username) => {
    return await UserModel.findOne({ username });
};

const comparePassword = async (inputPassword, hashedPassword) => {
    console.log('Comparing:', inputPassword, 'with', hashedPassword);
    return await bcrypt.compare(inputPassword, hashedPassword);
};

const loginUserWithToken = async (username, password) => {
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

    return {
        status: 'success',
        message: 'Login successful',
        access_token,
        refresh_token,
        user: userSafe
    };
};

const updateUser = async (userId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await UserModel.findOne({ _id: userId });
            if (!checkUser) {
                return resolve({
                    status: 'ERR',
                    message: 'User not found'
                });
            }

            const updateUser = await UserModel.findByIdAndUpdate(userId, data, {new: true});
            console.log("updateUser", updateUser);


            resolve({
                status: 'success',
                message: 'User updated successfully',
                data: updateUser
            });
        } catch (error) {
            reject(error);
        }
    });
};

const deleteUser = async (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await UserModel.findOne({ _id: userId });
            if (!checkUser) {
                return resolve({
                    status: 'ERR',
                    message: 'User not found'
                });
            }

            await UserModel.findByIdAndDelete(userId);


            resolve({
                status: 'success',
                message: 'User deleted successfully',
            });
        } catch (error) {
            reject(error);
        }
    });
};

const getAllUser = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUser = await UserModel.find({});
             resolve({
                status: 'success',
                data: allUser
            });
            
            } catch (error) {
            reject(error);
            }
    });
};

const getUserDetail = async (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await UserModel.findOne({ _id: userId });
            if (!user) {
                return resolve({
                    status: 'ERR',
                    message: 'User not found'
                });
            }


            resolve({
                status: 'success',
                data: user
            });
        } catch (error) {
            reject(error);
        }
    });
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
