import jwt from 'jsonwebtoken';
const verify_token = (req, res, next) => {
    const auth_header = req.headers['authorization'];
    const token = auth_header && auth_header.split(' ')[1];
    if (!token) return res.status(401).json({
        error: "No token provided"
    });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                error: "Invalid or expired token"
            })
        }
        req.user = decoded;
        next();
    })
};

export default verify_token;