import React from "react";

export default class Products extends React.Component {
  render() {
    return (
      <table border="1">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>In Stock</th>
          </tr>
        </thead>
        <tbody>
          {this.props.pList.map((product) => (
            <tr key={product.pid}>
              <td>{product.pid}</td>
              <td>{product.pName}</td>
              <td>{product.pPrice}</td>
              <td>{product.isInStock ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
