import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import { userChat,userSignup,userLogin,addChat,createChat,getChats,getSingleChats } from "./controller/userController.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true 
}));

app.use(express.json());


app.post("/chat", userChat);
app.post("/signup", userSignup);
app.post("/login",userLogin)
app.post("/chat/new", createChat);
app.post("/chat/:chatId", addChat);
app.get("/chat/:userId", getChats);
app.get("/chat/:chatId", getSingleChats);


mongoose.connect(process.env.MONGODB_URI, {
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("MongoDB connection error:", error));



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
