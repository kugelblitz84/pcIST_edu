import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
const authenticate = ({ role }) => async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: 'Authorization header missing or malformed'});
    }
    const token = authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({message: 'No token provided, not authorised'});
    }
    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        if(Date.now() >= decoded.exp * 1000){
            return res.status(401).json({message: 'Token expired, please login again'});
        }
        const user = await User.findById(decoded.id).select('-password');
        if(!user){
            return res.status(401).json({message: 'User not found'});
        }
        if(role){
            const allowedRoles = Array.isArray(role) ? role : [role];
            if(!allowedRoles.includes(user.role)){
                return  res.status(403).json({message: 'Forbidden: insufficient permissions'});
            }
        }
        req.user = user;
        next();
    }catch(error){
        console.error('Error in authenticate middleware:', error);
        return res.status(401).json({message: 'Invalid token'});
    }
}

export default authenticate;
