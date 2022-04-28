const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Go AutoCar Server is running')
})

app.listen(port, () => {
    console.log(`Go AutoCar Server is running at: http://localhost:${port}/`)
})