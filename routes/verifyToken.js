const jwt = require('jsonwebtoken');

// middleware to check if the token actually exist
module.exports = function (req, res, next) {
    const token = req.header('auth-token');
    if(!token) return res.status(401).send('Acess denied');
        try {
            const verified = jwt.verify(token, process.env.TOKEN_SECRET);
            req.user = verified;
            next();
        } catch (err) {
            res.status(400).send('Invalid request')
        }
}