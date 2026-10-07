import React from "react";
import { Link } from "react-router-dom";

class Navbar extends React.Component {
  render() {
    return (
      <div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/productslist">Products</Link>
          <Link to="/search">Search</Link>
          <Link to="/add">Add Product</Link>
          <Link to="/update">Update Product</Link>
          <Link to="/delete">Delete Product</Link>
        </nav>
      </div>
    );
  }
}

export default Navbar;
