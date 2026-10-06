import React from "react";

class Login extends React.Component {
  render() {
    return (
      <div>
        <h1>Please login</h1>
        <form>
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button>Login</button>
        </form>
      </div>
    );
  }
}

export default Login;
