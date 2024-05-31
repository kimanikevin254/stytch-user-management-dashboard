const express = require("express");
require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes");

const app = express();

// Enable CORS requests
app.use(cors({ origin: "http://localhost:3000" }));

// Parse JSON bodies
app.use(express.json());

// Register routes
app.use("/auth", authRoutes);
app.use("/organization", organizationRoutes);

app.listen(3001, () => console.log("Server running on port 3001"));