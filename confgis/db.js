import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });
        await mongoose.connect(`${process.env.MONGO_URI}/pcistEdu`);
        mongoose.connection.on('error', () => {
            console.log('MongoDB no connected');
        });
    }catch(err){
        console.error(err.message);
        process.exit(1);
    }
}
export default connectDB;