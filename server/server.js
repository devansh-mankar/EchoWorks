import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import app from "./src/app.js";
dotenv.config();

connectDB();

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
