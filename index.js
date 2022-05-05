const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Json web token verification
const verifyJwt = (req, res, next) => {
    // get bearer
    const authHeader = req.headers.authorization;

    // if the bearer not founded
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }

    // get access token
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        // access token decoded failed
        if (err) {
            return res.status(403).send({ message: 'request forbidden' });
        } else {
            // access token decoded successfully
            req.decoded = decoded;
            next();
        }
    });
};

// Connect MongoDb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        // authentication
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(
                user,
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: '1d',
                }
            );
            res.send({ accessToken });
        });

        // api created for all cars item
        app.get('/cars', async (req, res) => {
            const page = parseInt(req.query.page);
            const filter = parseInt(req.query.filter);

            const query = {};
            const cursor = carsCollection.find(query);

            let result;
            if (page || filter) {
                result = await cursor.skip(page*filter).limit(filter).toArray();
            } else {
                result = await cursor.toArray();
            }

            res.send(result);
        });

        app.get('/cars-pages', async (req, res) => {
            const count = await carsCollection.estimatedDocumentCount();

            res.send({ count });
        });

        // api created for all cars item
        app.get('/my-cars', verifyJwt, async (req, res) => {
            const emailDecoded = req.decoded.email;
            const email = req.query.email;

            if (emailDecoded !== email) {
                return res.status(403).send({ message: 'request forbidden' });
            } else {
                const query = { email };
                const cursor = carsCollection.find(query);
                const result = await cursor.toArray();

                res.send(result);
            }
        });

        // get the car details form the client side
        app.post('/cars', async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);

            res.send(result);
        });

        // single car by id
        app.get('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const car = await carsCollection.findOne(query);

            res.send(car);
        });

        // Delete single car item
        app.delete('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.deleteOne(query);

            res.send(result);
        });

        // update car quantity
        app.put('/car/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCars = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedCars.quantity,
                },
            };

            const result = await carsCollection.updateOne(
                filter,
                updatedDoc,
                options
            );

            res.send(result);
        });
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
