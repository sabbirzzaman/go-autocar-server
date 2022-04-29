const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDb
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3xsit.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const run = async () => {
    try {
        await client.connect();
        const carsCollection = client.db('carsCollection').collection('cars');

        
    } finally {
    }
};

// Call run function
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Go AutoCar Server is running');
});

app.listen(port, () => {
    console.log(`Go AutoCar Server is running at: http://localhost:${port}/`);
});
