import "./App.css";
import Chatbot from "./pages/Chatbot";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./pages/Nav";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary flex flex-col md:flex-row ">
      <Nav />
      <Router>
        <Routes>
          <Route path="/" element={<Chatbot />} />
        </Routes>
      </Router>
    </div>
  );
}
