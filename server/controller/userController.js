import axios from "axios";
import dotenv from "dotenv";
// import userModel from "../models/userSchema";


dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MISTRAL_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

export const userChat = async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await axios.post(
      MISTRAL_API_URL,
      { inputs: userMessage },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );

    const botReply = response.data[0].generated_text ;
    res.json({ botReply });
  } catch (error) {
    console.error("Error:", error?.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
};