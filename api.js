const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const configDB = require("./configDB");
const SlotRoutes = require("./Routes/SlotRoutes");
const { initializeSlots } = require("./Controllers/SlotController");

const app = express();

// Configure the database
configDB()
  .then(() => {
    // Load environment variables from .env file
    dotenv.config();

    // Initialize slots after the database connection is established
    return initializeSlots();
  })
  .then(() => {
    // Set up middleware
    app.use(cors());
    app.use(bodyParser.json());

    // Set up routes
    app.use("/slots", SlotRoutes);

    // Use process.env.PORT or fallback to 4000 if PORT is not defined
    const PORT = process.env.PORT || 4000;

    // Start the server
    app.listen(PORT, () => {
      console.log(`The server is running on port ${PORT}`);
    });

    // Default route
    app.get("/", (req, res) => {
      res.send("We developed the backend Server!!!");
    });
  })
  .catch((error) => {
    console.error("Error configuring the database:", error);
  });
