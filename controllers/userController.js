const getUserData = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isActive = true;
        await user.save();
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error in getUserData:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const getStudentList = async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'admin' && user.role !== 'teacher') {
            return res.status(403).json({ message: 'Forbidden: only Admins and Teachers can access student list' });
        }
        const students = await User.find({ role: 'student' }).select('-password');
        res.status(200).json({ students });
    } catch (error) {
        console.error('Error in getStudentList:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const getTeacherList = async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: only Admins can access teacher list' });
        }
        const teachers = await User.find({ role: 'teacher' }).select('-password');
        res.status(200).json({ teachers });
    } catch (error) {
        console.error('Error in getTeacherList:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }   
};

export { getUserData , getStudentList , getTeacherList };