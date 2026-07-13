const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
    res.json({ message: "Backend API is running" });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Default port aligns with the frontend's default VITE_API_URL (http://localhost:5005/api)
const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
