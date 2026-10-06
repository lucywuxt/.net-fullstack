import React from 'react';

export default class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      fristName: "Wucy",
      lastName: "Lu",
      age: 25,
      isMarried: false,
      address: {
        street: "street",
        city: "city",
        state: "state"
      }
    }
  }

  render(){
    return(
      <div>
        <h1>State Demo</h1>
        <h2>First Name: {this.state.fristName}</h2>
        <h2>Last Name: {this.state.lastName}</h2>
        <h2>Age: {this.state.age}</h2>
        <h2>Married: {this.state.isMarried ? "Yes" : "No"}</h2>
        <h2>Address: {this.state.address.street}, {this.state.address.city}, {this.state.address.state}</h2>
      </div>
    )
  }
}