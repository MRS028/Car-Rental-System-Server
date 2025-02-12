﻿# Rent A Car 🚗

Rent A Car is a full-stack car rental application that allows users to browse, book, and manage their favorite cars for rent. Built with Node.js, MongoDB, and other modern tools, the platform ensures seamless and secure transactions.

## Features
- **Browse Cars**: Explore available cars with details such as model, price, availability, and features.
- **Add and Manage Cars**: Add new cars to the database, update car details, or remove cars.
- **Secure Authentication**: JWT-based authentication with cookies for secure login/logout.
- **Car Booking**: Book cars with custom pickup and drop-off dates.
- **My Cars and My Bookings**: View your listed cars and booked rentals.
- **Booking Count**: Track the popularity of each car by incrementing booking counts.
- **Responsive and Secure**: Ensures secure and user-friendly interactions.

## Live Demo
🚀 Check out the live application-1 here: [Rent A Car Live](https://car-rental-system-b10a11.web.app)


🚀 Check out the live application-2 here: [Rent A Car Live](https://car-rental-system-b10a11.firebaseapp.com)

## Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **File Uploads**: Multer
- **Environment Variables**: dotenv
- **Frontend**: Tailored for integration with modern frameworks like React.

## API Endpoints
### Public
- `/` - Home route to verify the server.
- `/allCars` - Fetch all available cars.

### Authenticated
- `/jwt` - Login and receive a token.
- `/logout` - Logout and clear token.
- `/myCars` - View cars listed by the logged-in user.
- `/myBookings` - View bookings made by the logged-in user.

### CRUD Operations
- **Cars**:
  - `POST /cars` - Add a new car.
  - `PUT /cars/:id` - Update a car's details.
  - `DELETE /cars/:id` - Delete a car.
  - `GET /cars/:id` - Fetch details of a single car.
- **Bookings**:
  - `POST /bookingCar` - Book a car.
  - `PUT /updateBooking/:id` - Update booking details.
  - `DELETE /bookingcar/:id` - Delete a canceled booking car.
  - `PUT /increment/:id` - Increment a car's booking count.

## Thank You
