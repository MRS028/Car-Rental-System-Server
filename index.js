const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
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
  client
    .connect()
    .then(() => {
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );

      // CarCollection in database
      const carsCollection = client.db("CarHub").collection("cars");
      //booking collection
      const bookingCarCollection = client.db("CarHub").collection("bookingCar");

      // POST API for adding a new car
      app.post("/cars", upload.array("images"), async (req, res) => {
        const carData = {
          model: req.body.model,
          price: req.body.price,
          availability: req.body.availability,
          registrationNumber: req.body.registrationNumber,
          features: req.body.features,
          seats: req.body.seats,
          description: req.body.description,
          location: req.body.location,
          date: req.body.date,
          bookingCount: req.body.bookingCount,
          bookingStatus: req.body.bookingStatus,
          userDetails: {
            name: req.body.userName,
            email: req.body.userEmail,
          },
          images: req.files.map((file) => ({
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            data: file.buffer.toString("base64"),
          })),
        };

        // const images = req.files.map((file) => ({
        //   filename: file.originalname,
        //   mimetype: file.mimetype,
        //   size: file.size,
        //   path: file.path,
        //   data: file.buffer.toString("base64"),
        // }));

        const result = await carsCollection.insertOne(carData);
        res.send(result);
      });

      //Update Car option
      app.put("/cars/:id", upload.array("images", 5), (req, res) => {
        const carId = req.params.id;

        if (!ObjectId.isValid(carId)) {
          return res.status(400).json({ message: "Invalid car ID format" });
        }

        const objectId = new ObjectId(carId);
        const {
          model,
          price,
          availability,
          registrationNumber,
          features,
          seats,
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
          data: file.buffer.toString("base64"),
        }));

        const updatedCar = {
          ...(model && { model }),
          ...(price && { price }),
          ...(availability && { availability }),
          ...(registrationNumber && { registrationNumber }),
          ...(features && { features }),
          ...(seats && { seats }),
          ...(description && { description }),
          ...(location && { location }),
          ...(date && { date }),
          ...(bookingStatus && { bookingStatus }),
          ...(userName || userEmail
            ? { userDetails: { name: userName, email: userEmail } }
            : {}),
          ...(images.length > 0 && { images }),
        };

        carsCollection
          .updateOne({ _id: objectId }, { $set: updatedCar })
          .then((result) => {
            if (result.modifiedCount === 0) {
              return res
                .status(404)
                .json({ message: "Car not found or no changes made" });
            }
            res.status(200).json({ message: "Car updated successfully" });
          })
          .catch((error) => {
            console.error("Error updating car:", error);
            res
              .status(500)
              .json({ message: "Failed to update car", error: error.message });
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
            res.status(500).send({
              success: false,
              message: "Failed to fetch cars.",
              error: error.message,
            });
          });
      });
      //delete a car

      app.delete("/cars/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await carsCollection.deleteOne(query);
        res.send(result);
      });

      app.get("/cars/:id", async (req, res) => {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid ObjectId format" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await carsCollection.findOne(query);
        if (!result) {
          return res.status(404).json({ error: "Car not found" });
        }
        res.send(result);
      });

      //My Cars section
      app.get("/myCars", async (req, res) => {
        const email = req.query.email;

        const query = { "userDetails.email": email };
        const result = await carsCollection.find(query).toArray();

        res.send(result);
      });

      //book a car part

      //book car post
      app.post("/bookingCar", (req, res) => {
        const bookACar = req.body;

        carsCollection
          .findOne({ registrationNumber: bookACar.registrationNumber })
          .then((car) => {
            if (!car) {
              return res.status(404).send("Car not found");
            }

            const bookingData = {
              ...bookACar,
              carId: car._id,
              carInfo: {
                images: car.images,

                registrationNumber: car.registrationNumber,
                bookingStatus: car.bookingStatus,
                price: car.price,
                model: car.model,
              },
            };

            return bookingCarCollection.insertOne(bookingData);
          })
          .then((result) => {
            res.send(result);
          })
          .catch((error) => {
            console.error("Error in booking a car:", error);
            res.status(500).send("Internal Server Error");
          });
      });

      //my bookings
      app.get("/myBookings", async (req, res) => {
        const email = req.query.email;
        const query = { email: email };

        const result = await bookingCarCollection.find(query).toArray();

        res.send(result);
      });

      //update Booking date
      app.put("/updateBooking/:id", async (req, res) => {
        const { id } = req.params;
        const updateBookingDate = req.body;

        const filter = { _id: new ObjectId(id) };
        const updateBookingDetails = {
          $set: {
            bookingStatus: updateBookingDate.bookingStatus,
            pickUpDate: updateBookingDate.pickUpDate,
            dropOffDate: updateBookingDate.dropOffDate,
          },
        };
        const result = await bookingCarCollection.updateOne(
          filter,
          updateBookingDetails
        );
        res.send({ message: "Booking updated", updatedBooking: result });
      });

      //car boking Count
      app.put("/increment/:id", async (req, res) => {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const car = await carsCollection.findOne(query);
        if (!car) {
          return res.json({ message: "Car Not Found" });
        }

        if (typeof car.bookingCount !== "number") {
          const parsedCount = parseInt(car.bookingCount, 10);
          await carsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                bookingCount: isNaN(parsedCount) ? 0 : parsedCount,
              },
            }
          );
        }

        const result = await carsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { bookingCount: 1 } }
        );

        if (result.modifiedCount > 0) {
          const updatedCar = await carsCollection.findOne({
            _id: new ObjectId(id),
          });
          return res.send({
            message: "Booking count incremented successfully",
            car: updatedCar,
          });
        }

        return res.status(404).json({ message: "Car not found" });
      });

      //Last
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err);
    });
}

run();

// Start the server
app.listen(port, () => {
  console.log(`Car is waiting at: ${port}`);
});
