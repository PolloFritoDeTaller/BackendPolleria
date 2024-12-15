import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv'
import morgan from 'morgan';
import connectToMongoDB from './db.js';
import branchsRouter from './routes/branch.routes.js';
import productsBranchRouter from './routes/product.branch.routes.js';
import salesBranchRouter from './routes/sale.branch.routes.js';
import employeeBranchRouter from './routes/employee.branch.routes.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import inventoryBranchRouter from './routes/inventory.branch.routes.js';
import ingredientBranchRouter from './routes/ingredient.branch.routes.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({/*
    origin: (origin, callback) => {
        callback(null, origin); // Permite cualquier origen
    },*/
    origin: 'https://frontendpolleria.onrender.com',
    credentials: true, // Access to credentials
}));

app.use(morgan('dev'));

connectToMongoDB();

app.use(cookieParser());
app.use('https://backendpolleria.onrender.com/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;

app.use('/api', authRouter);
app.use('/api/branches', branchsRouter);
app.use('/api/branch/products', productsBranchRouter);
app.use('/api/branch/sales', salesBranchRouter);
app.use('/api/branch/employees', employeeBranchRouter);
app.use('/api/branch/inventory', inventoryBranchRouter);

app.use('/api/branch/ingredients', ingredientBranchRouter);

app.listen(PORT, () => {
    console.log("Backend listen on port", PORT);
})