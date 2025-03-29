import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import { userChat,userSignup,userLogin,createChat,getChats } from "./controller/userController.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://chatbot-qjs9.vercel.app"], 
  credentials: true 
}));


app.use(express.json());


app.post("/chat", userChat);
app.post("/signup", userSignup);
app.post("/login",userLogin)
app.post("/createChat", createChat);
app.get("/getChat", getChats);



mongoose.connect(process.env.MONGODB_URI, {
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("MongoDB connection error:", error));



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
