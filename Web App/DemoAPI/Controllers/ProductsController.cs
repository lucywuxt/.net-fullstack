using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using firestRSTFulService.Models;

namespace firestRSTFulService.Controllers
{

    // [Attributes] - info given to compiler to treat the code in a certain way
    [ApiController] // make it a controller
    [Route("api/[controller]")] // to access the methods of this controller
    public class ProductsController : ControllerBase
    {
        // methods will return HTTP Status Codes
        // methods decorated with HTTP Verbs (GET, POST, PUT, PATCH, DELETE)
        ProductsModel model = new ProductsModel(); // bad code, will use dependancy injection here
        #region Get APIs
        [HttpGet]
        [Route("allproducts")]
        public IActionResult GetAllProducts()
        {
            return Ok(model.GetAllProducts());
        }

        [HttpGet]
        [Route("searchbyid/{id}")]
        public IActionResult SearchProductByID(int id)
        {
            try
            {
                return Ok(model.GetProductByID(id));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet]
        [Route("totalproducts")]
        public IActionResult GetTotalProducts()
        {
            return Ok(model.TotalProducts());
        }

        [HttpGet]
        [Route("searchbycategory/{c}")]
        public IActionResult GetProductsByCategory(string c)
        {
            try
            {
                return Ok(model.GetProductsByCategory(c));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        #endregion
        #region Add APIs
        [HttpPost]
        [Route("addnewproduct/{newProduct}")]
        public IActionResult AddNewProdcut(ProductsModel newProduct)
        {
            try
            {
                var addResult = model.AddProduct(newProduct);
                return Created("", addResult);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        #endregion
        #region Delete API
        [HttpDelete]
        [Route("deleteproduct/{id}")]
        public IActionResult DeleteProduct(int id)
        {
            try
            {
                var deleteResult = model.DeleteProduct(id);
                return Ok(deleteResult);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        #endregion
        #region Update API
        [HttpPut]
        [Route("updateproduct")]
        public IActionResult EditProduct(ProductsModel product_to_update)
        {
            try
            {
                var updateResult = model.UpdateProduct(product_to_update);
                return Ok(updateResult);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        #endregion
    }
}