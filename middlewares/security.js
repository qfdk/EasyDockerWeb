const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const rawToken = req.headers['authorization'];
    if (!rawToken) { // 检查是否存在token
        return res.status(403).send({message: 'No token provided!'});
    }

    const tokenParts = rawToken.split('Bearer ');
    if (tokenParts.length !== 2) { // 检查token格式是否正确
        return res.status(403).send({message: 'Invalid token format!'});
    }

    const token = tokenParts[1]; // 获取token部分
    if (!token || token === 'undefined') { // 检查token是否存在或者为字符串"undefined"
        return res.status(403).send({message: 'No token provided!'});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // 验证token
        if (err) {
            return res.status(401).send({message: 'Unauthorized!', err});
        }
        req.user = user;
        return next();
    });
};

/**
 * 权限检查
 * @param role
 * @returns {(function(*, *, *): (*))|*}
 */
const hasRole = (role) => (req, res, next) => {
    if (req.user.roles.includes(role)) {
        return next();
    } else {
        return res.status(401).send({message: 'Unauthorized!'});
    }

};

module.exports = {
    verifyToken,
    hasRole
};
