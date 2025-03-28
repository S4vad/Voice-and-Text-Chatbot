import axios from "axios";
import dotenv from "dotenv";
import userModel from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Chat from "../models/Chat.js";

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MISTRAL_API_URL =
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

export const userChat = async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await axios.post(
      MISTRAL_API_URL,
      { inputs: userMessage },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );

    const botReply = response.data[0].generated_text;
    res.json({ botReply });
  } catch (error) {
    console.error("Error:", error?.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
};

export async function userSignup(req, res) {
  const { name, email, password } = req.body;
  console.log(req.body);

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "email already in use!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
    console.log("New user created:", newUser);

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || "defaultsecret123",
      { expiresIn: "5d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "lax",
    });

    res.status(201).json({
      message: "User signed up successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "server error!" });
  }
}

export async function userLogin(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Email is not registered" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Password is not correct" });
    }

    const role = user.isBusiness ? "business" : "influencer";

    const token = jwt.sign(
      { userId: user.id, role },
      process.env.JWT_SECRET || "jwt123",
      { expiresIn: "5d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      message: "user Logined succesfully !",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBusiness: user.isBusiness,
        role: role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "server error!" });
  }
}

export async function createChat(req, res) {
  const { userId, title } = req.body;

  try {
    const newChat = new Chat({ userId, title, messages: [] });
    await newChat.save();
    res.status(201).json({ chatId: newChat._id, title });
  } catch (error) {
    res.status(500).json({ error: "Failed to create chat" });
  }
}

export async function addChat(req, res) {
  const { chatId } = req.params;
  const { userMessage } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const botReply = `Bot response to: ${userMessage}`;

    chat.messages.push({ sender: "user", content: userMessage });
    chat.messages.push({ sender: "bot", content: botReply });

    await chat.save();
    res.json({ botReply });
  } catch (error) {
    res.status(500).json({ error: "Error saving chat" });
  }
}


export  async function getChats(req, res) {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).select("title");
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
  
}


export  async function getSingleChats(req, res) {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to load chat history" });
  }
}