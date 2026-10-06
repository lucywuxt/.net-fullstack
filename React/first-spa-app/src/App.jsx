import React from "react";
import Home from "./components/Home";
import Login from "./components/Login";
import About from "./components/About";
import Contact from "./components/Contact";
import News from "./components/News";
import Navbar from "./components/Navbar";
import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";
class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <h1>My SPA App</h1>

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/news" element={<News/>} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
