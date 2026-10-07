import React from "react";
import Details from "./details";
import Products from "./products";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fristName: "Wucy",
      lastName: "Lu",
      age: 25,
      isMarried: false,
      address: {
        street: "street",
        city: "city",
        state: "state",
      },
      productList: [
        { pid: 101, pName: "Coke", pPrice: 3, isInStock: true },
        { pid: 102, pName: "doggy", pPrice: 10, isInStock: false },
        { pid: 103, pName: "iPhone 18", pPrice: 1200, isInStock: true },
        { pid: 104, pName: "water", pPrice: 100, isInStock: false },
      ],

      counter: 0,

      greetUser: function (guestName) {
        alert(`Hello ${guestName}, welcome to our website!`);
      },
    };
  }

  AddToCounter = () => {
    this.setState({ counter: this.state.counter + 1 });
  };

  DecreaseCounter = () => {
    this.setState({ counter: this.state.counter - 1 });
  };

  render() {
    return (
      <div>
        <h1>State Demo</h1>

        <h2>First Name: {this.state.fristName}</h2>
        <h2>Last Name: {this.state.lastName}</h2>
        <h2>Age: {this.state.age}</h2>
        <h2>Married: {this.state.isMarried ? "Yes" : "No"}</h2>
        <h3>
          Address: {this.state.address.street}, {this.state.address.city},
          {this.state.address.state}
        </h3>
        <hr />
        <Products pList={this.state.productList} />
        <hr />
        <Details
          fName={this.state.fristName}
          lName={this.state.lastName}
          city={this.state.address.city}
          counter={this.state.counter}
          greetings={this.state.greetUser}
        />
        <hr />
        <h2>Counter: {this.state.counter}</h2>
        <button onClick={this.AddToCounter}>Add</button>
        <button onClick={this.DecreaseCounter}>Subtract</button>
      </div>
    );
  }
}


