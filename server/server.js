import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userChat } from "./controller/userController.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



app.post("/chat", userChat);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
