import React from "react";

export default class Details extends React.Component {
  render() {
    return (
      <div>
        <h1>Details Component</h1>
        <h2>
          {" "}
          Developer: {this.props.fName} {this.props.lName}
        </h2>
        <p> City: {this.props.city}</p>

        <hr />
        <h2>Counter Value: {this.props.counter}</h2>
        <button onClick={() => this.props.greetings("Wucy")}>Greet User</button>
      </div>
    );
  }
}
