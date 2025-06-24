const dotenv = require('dotenv');
dotenv.config();

const jwt = require('jsonwebtoken');


const generateAccessToken = (payload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30s' });
    return accessToken;
};

const generateRefreshToken = (payload) => {
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return refreshToken;
};

const refreshTokenJwtService = (token) => {
    return new Promise((resolve, reject) => {
        try {
            console.log("token", token);
            jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, user) => {
                if (err) {
                    resolve({
                        status: 'ERR',
                        message: 'Invalid refresh token'
                    });
                }
                const access_token = await generateAccessToken ({
                    id: user.id,
                    role: user.role
                })       
                 resolve({
                    status: 'success',
                    access_token
                }); 
            })
            
           
        } catch (error) {
            reject(error);
        }
    });
};


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    refreshTokenJwtService
};
