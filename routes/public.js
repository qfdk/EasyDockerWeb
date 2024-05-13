const router = require('express').Router();
const jwt = require('jsonwebtoken');
const {logger} = require('../utils/logger');

const accessTokenExpiresIn = 24 * 60 * 60 * 1000;
const refreshTokenExpiresIn = 3 * 24 * 60 * 60 * 1000; // 新 refreshToken 的过期时间

// 公共函数：生成 accessToken 和 refreshToken
const generateTokens = (userInfo, accessTokenExpiresIn, refreshTokenExpiresIn) => {
    const accessToken = jwt.sign(userInfo, process.env.JWT_SECRET, {expiresIn: accessTokenExpiresIn});
    const refreshToken = jwt.sign(userInfo, process.env.JWT_SECRET, {expiresIn: refreshTokenExpiresIn});
    const expires = new Date(new Date()).getTime() + accessTokenExpiresIn;
    return {accessToken, refreshToken, expires};
};

// 登录路由
router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try {
        if (process.env.EDW_USERNAME === username && process.env.EDW_PASSWORD === password) {
            const userInfo = {id: 1, username, roles: ['admin']};
            const {
                accessToken,
                refreshToken,
                expires
            } = generateTokens(userInfo, accessTokenExpiresIn, refreshTokenExpiresIn);
            return res.status(200).send({
                success: true,
                data: {...userInfo, accessToken, refreshToken, expires}
            });
        } else {
            return res.status(402).send({success: false, message: '用户名密码不正确'});
        }
    } catch (error) {
        logger.error(error);
        return res.status(500).send({success: false, message: 'Internal Server Error!'});
    }
});

// 刷新 refreshToken 路由
router.post('/refresh-token', async (req, res) => {

    try {
        const rawRefreshToken = req.body.refreshToken;
        if (!rawRefreshToken) {
            return res.status(400).send({success: false, message: 'Refresh token not provided'});
        }
        // 验证并解码 refreshToken
        const decoded = jwt.verify(rawRefreshToken, process.env.JWT_SECRET);
        const {id, username, roles} = decoded;

        // 重新生成 accessToken 和 refreshToken
        const userInfo = {id, username, roles};
        const {
            accessToken,
            refreshToken,
            expires
        } = generateTokens(userInfo, accessTokenExpiresIn, refreshTokenExpiresIn);

        // 返回新的 accessToken 和 refreshToken
        return res.status(200).send({
            success: true,
            data: {...userInfo, accessToken, refreshToken, expires}
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({success: false, message: 'Refresh token expired'});
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({success: false, message: 'Invalid refresh token'});
        } else {
            logger.error(error);
            return res.status(500).send({success: false, message: 'Internal Server Error!', error: error.message});
        }
    }
});


module.exports = router;
