import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './db.js';



const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});


app.use(cors());
app.use(express.json());
connectDB();




const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`TraceGuard Server running on http://localhost:${PORT}`);
});
