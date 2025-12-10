import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import slugify from 'slugify';
import validator from 'validator';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


const createToken = ({ id, slug, role, email, name }) => {
    return jwt.sign({ id, slug, role, email, name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
const registerStudent = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }
        const slug = slugify(email, { lower: true });
        const salt = await bcrypt.gensalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            slug,
            password: hashedPassword,
            role: 'student',
            isActive: true,
            createdAt: new Date(),
        });
        await newUser.save();

        const token = createToken({
            id: newUser._id,
            slug: newUser.slug,
            role: newUser.role,
            email: newUser.email,
            name: newUser.name
        });
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const registerTeacher = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: only Admins can register Teachers' });
        }
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }
        const slug = slugify(email, { lower: true });
        const salt = await bcrypt.gensalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            email,
            slug,
            password: hashedPassword,
            role: 'teacher',
            isActive: true,
            createdAt: new Date(),
        });
        await newUser.save();
        const token = createToken({
            id: newUser._id,
            slug: newUser.slug,
            role: newUser.role,
            email: newUser.email,
            name: newUser.name
        });
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = createToken({
            id: user._id,
            slug: user.slug,
            role: user.role,
            email: user.email,
            name: user.name
        });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


export { registerStudent, registerTeacher, loginUser };