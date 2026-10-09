import { useState } from "react";
import type { FormEvent } from "react";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setMessage("All fields are required");
      return;
    }

    if (
      username === "admin" &&
      password === "admin123"
    ) {
      setMessage("Login Successful");
    } else {
      setMessage("Invalid Credentials");
    }
  };

  return (
    <div>
      <h1>Login Component</h1>

      <form onSubmit={handleLogin}>

        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Login</button>

      </form>

      <p role="status">{message}</p>
    </div>
  );
}