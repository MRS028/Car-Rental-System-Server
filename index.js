const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
const upload = multer();

// Home route
app.get("/", (req, res) => {
  res.send("Your favourite Car is waiting for you...");
});

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3w3t.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

function run() {
  // MongoDB connection
  client.connect().then(() => {
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // CarCollection in database
    const carsCollection = client.db("CarHub").collection("cars");

    // POST API for adding a new car
    app.post('/cars', upload.array('images'), async (req, res) => {
      const { model, price, availability, registrationNumber, features, description, location, date, bookingStatus, userName, userEmail } = req.body;
      const images = req.files.map((file) => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path, // If saving locally
        data: file.buffer.toString('base64'), // For saving in database as Base64
      }));
    
      const newCar = {
        model,
        price,
        availability,
        registrationNumber,
        features,
        description,
        location,
        date,
        bookingStatus,
        userDetails: { name: userName, email: userEmail },
        images, // Store image data
      };
    
      const result = await carsCollection.insertOne(newCar);
      res.send(result);
    });
    

    // GET API to fetch all cars
    app.get("/allCars", (req, res) => {
      carsCollection
        .find()
        .toArray()
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((error) => {
          console.error("Error fetching cars:", error);
          res.status(500).send({ success: false, message: "Failed to fetch cars.", error: error.message });
        });
    });
  }).catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
}

run();

// Start the server
app.listen(port, () => {
  console.log(`Car is waiting at: ${port}`);
});
