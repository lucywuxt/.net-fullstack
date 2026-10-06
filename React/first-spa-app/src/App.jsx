import React from 'react';
import Home from './components/Home';
import Login from './components/Login';

class App extends React.Component {
  render(){
    return(
      <div>
        <h1>Hello, World!</h1>
        <Home />
        <Login />
      </div>
    )
  }
}

export default App;