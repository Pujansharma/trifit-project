const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config');
const userRoutes = require('./routes');
require('dotenv').config();
const app = express();
connectDB();
app.use(express.json());
app.use(cors());
app.use (bodyParser.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});