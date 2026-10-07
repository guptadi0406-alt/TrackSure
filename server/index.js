import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './db.js';
import parcelRoutes from "./routes/parcelRoutes.js";
import scanRoutes from "./routes/scanRoutes.js";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});


app.use(cors());
app.use(express.json());
connectDB();

app.use("/api/parcels", parcelRoutes);
app.use("/api/scans", scanRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
