const crypto = require('crypto');

const WEAK_PASSWORDS = ['admin', 'password', '123456', 'changeme'];

/**
 * Fail closed: refuse to start without explicit, non-trivial credentials.
 * Previously, when EDW_USERNAME / EDW_PASSWORD were unset, the check
 * `req.body?.username === undefined` succeeded for any request without a
 * body, which authenticated every visitor (and therefore gave full access
 * to the Docker socket).
 */
const assertCredentialsConfigured = () => {
    const username = process.env.EDW_USERNAME;
    const password = process.env.EDW_PASSWORD;
    if (!username || !password) {
        console.error('[security] EDW_USERNAME and EDW_PASSWORD must be set. Refusing to start.');
        process.exit(1);
    }
    if (password.length < 8 || WEAK_PASSWORDS.includes(password.toLowerCase())) {
        console.error('[security] EDW_PASSWORD is too weak (min. 8 chars, not a default value). Refusing to start.');
        process.exit(1);
    }
};

// Constant-time string comparison (hash first so lengths always match).
const safeEqual = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }
    const ha = crypto.createHash('sha256').update(a).digest();
    const hb = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(ha, hb);
};

const checkUser = (req, res, next) => {
    res.locals.isLogin = false;
    if (req.session.isLogin) {
        res.locals.isLogin = true;
        return next();
    }
    if (req.method === 'POST') {
        const ok = safeEqual(req.body?.username, process.env.EDW_USERNAME)
            && safeEqual(req.body?.password, process.env.EDW_PASSWORD);
        if (ok) {
            // Prevent session fixation.
            return req.session.regenerate((err) => {
                if (err) {
                    return next(err);
                }
                req.session.isLogin = true;
                res.redirect('/');
            });
        }
    }
    res.status(401).render('login');
};

// Socket.IO guard: every socket must carry an authenticated session.
const checkSocket = (socket, next) => {
    if (socket.request.session?.isLogin) {
        return next();
    }
    next(new Error('unauthorized'));
};

module.exports = {
    assertCredentialsConfigured,
    checkUser,
    checkSocket
};
