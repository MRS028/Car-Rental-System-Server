const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
        path: file.path, 
        data: file.buffer.toString('base64'), 
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
        images, 
      };
    
      const result = await carsCollection.insertOne(newCar);
      res.send(result);
    });
    //Update Car option
    app.put("/cars/:id", upload.array("images", 5), (req, res) => {
      const carId = req.params.id;
    
      let objectId;
      try {
        objectId = new ObjectId(carId); // Properly instantiate ObjectId
      } catch (error) {
        return res.status(400).json({ message: "Invalid car ID format" });
      }
    
      const {
        model,
        price,
        availability,
        registrationNumber,
        features,
        description,
        location,
        date,
        bookingStatus,
        userName,
        userEmail,
      } = req.body;
    
      const images = req.files.map((file) => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path, 
        data: file.buffer.toString('base64'), 
      }));
    
    
      const updatedCar = {
        ...(model && { model }),
        ...(price && { price }),
        ...(availability && { availability }),
        ...(registrationNumber && { registrationNumber }),
        ...(features && { features }),
        ...(description && { description }),
        ...(location && { location }),
        ...(date && { date }),
        ...(bookingStatus && { bookingStatus }),
        ...(userName || userEmail ? { userDetails: { name: userName, email: userEmail } } : {}),
        ...(images.length > 0 && { images }),
      };
    
      carsCollection
        .updateOne({ _id: objectId }, { $set: updatedCar })
        .then((result) => {
          if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Car not found or no changes made" });
          }
          res.status(200).json({ message: "Car updated successfully" });
        })
        .catch((error) => {
          console.error("Error updating car:", error);
          res.status(500).json({ message: "Failed to update car", error: error.message });
        });
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

    app.get('/cars/:id', async(req,res)=>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)};
      const result = await carsCollection.findOne(query);

      res.send(result);
    })

    //My Cars section
    app.get('/myCars', async (req, res) => {
      const email = req.query.email; 
      if (!email) {
        return res.status(400).json({ message: "Email query parameter is required" });
      }
      const query = { 'userDetails.email': email }; 
      const result = await carsCollection.find(query).toArray();
      if (result.length === 0) {
        return res.status(404).json({ message: "No cars found for this email" });
      }
      res.send(result); 
    });


    //delete a car

    app.delete('/cars/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await carsCollection.deleteOne(query);
      res.send(result);
    })

    
    
    








    //Last
  }).catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
}

run();

// Start the server
app.listen(port, () => {
  console.log(`Car is waiting at: ${port}`);
});
