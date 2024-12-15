import mongoose from 'mongoose';

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(">>> DB is connected");
    } catch (error) {
        console.log(error);
        process.exit(1);  // Detiene el proceso si no se puede conectar
    }
}

export default connectToMongoDB;

/*
const connectToMongoDB = async () => {
    try {
        mongoose.connect('mongodb://127.0.0.1:27017/sistema_adm_polleriaDB');
        console.log(">>> DB is connected");
    } catch (error) {
        console.log(error);
    }
}

export default connectToMongoDB;
*/