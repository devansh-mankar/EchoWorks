import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import app from "./src/app.js";
import { mountEchoDubWSS } from "./src/ws/echodub.ws.js";
import http from "http";
dotenv.config();

connectDB();
const server = http.createServer(app);
mountEchoDubWSS(server);

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
