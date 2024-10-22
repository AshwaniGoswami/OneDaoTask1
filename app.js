const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./config/dbConfig");

// Load environment variables from .env file
dotenv.config();

const app = express();

// use cors for cross origin resource sharing. Currently its set to allow all origins
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create users and products table. Currently handling it from the application code only Otherwise its not necessary
(async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        otp VARCHAR(6),
        otpStatus BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table created successfully");

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        carComfort VARCHAR(255) NOT NULL,
        startLocation varchar(255) NOT NULL,
        endLocation varchar(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        userid int NOT NULL references users(id),
        ordered_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Products table created successfully");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
})();

// Routes
const userRoute = require("./routes/userRoutes");
app.use("/api", userRoute);

const productRoute = require("./routes/productRoutes");
app.use("/api", productRoute);

// Server start at port 3000 and then logging in console
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
