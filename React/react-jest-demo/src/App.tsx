import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from "react-router-dom";

import Home from "./components/Home";
import About from "./components/About";
import Counter from "./components/Counter";
import Login from "./components/Login";
import Registration from "./components/Registration";

import "./App.css";

export default function App() {

  return (
    <BrowserRouter>

      <nav className="navbar">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/counter">Counter</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/registration">Registration</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/counter"
            element={<Counter />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/registration"
            element={<Registration />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="*"
            element={<h1>404 - Page Not Found</h1>}
          />
        </Routes>
      </main>

    </BrowserRouter>
  );
}