import React from "react";
import ProductList from "./components/productlist";
import Home from "./components/home";
import Search from "./components/search";
import Navbar from "./components/navbar";
import Add from "./components/addproduct";
import Update from "./components/updateproduct";
import Delete from "./components/deleteproduct";
import { BrowserRouter, Route, Routes } from "react-router-dom";
class App extends React.Component {
  // componentDidMount is a lifecycle method that is called after the component is mounted (inserted into the DOM). 
  // It is commonly used for making API calls or fetching data from a server.
  componentDidMount() {
    fetch("https://fakestoreapi.com/products")
      .then((response) => response.json())
      .then((data) => {
        // Do something with the fetched data
        this.setState({ products: data });
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }

  render() {
    return (
      <BrowserRouter>
        <h1>Shopping Web App</h1>

        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productslist" element={<ProductList />} />
          <Route path="/search" element={<Search />} />
          <Route path="/add" element={<Add />} />
          <Route path="/update" element={<Update />} />
          <Route path="/delete" element={<Delete />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
