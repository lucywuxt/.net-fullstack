namespace firestRSTFulService.Models
{
    public class ProductsModel
    {
        #region Properties
        public int ProductID { get; set; }
        public string ProductName { get; set; } = "";
        public string CategoryName { get; set; } = "";
        public string Description { get; set; } = "";
        public int Price { get; set; }
        #endregion

        #region Seed Data
        static List<ProductsModel> productsList = new List<ProductsModel>()
        {
          new ProductsModel() {ProductID = 1, ProductName = "Pepsi", CategoryName = "Drinks", Description = "a type of soda", Price = 3},
          new ProductsModel() {ProductID = 2, ProductName = "Lays", CategoryName = "Snacks", Description = "a type of chips", Price = 4},
          new ProductsModel() {ProductID = 3, ProductName = "Ferrero", CategoryName = "Chocolates", Description = "a type of chocolate", Price = 6},
          new ProductsModel() {ProductID = 4, ProductName = "Nike", CategoryName = "Shoes", Description = "Just do it!", Price = 100},
          new ProductsModel() {ProductID = 5, ProductName = "Apple", CategoryName = "Tech", Description = "WOW", Price = 2000}
        };
        #endregion

        // CRUD Methods
        #region Add Method
        public string AddProduct(ProductsModel product)
        {
            // do validation here

            if (product.Price < 2) throw new Exception("Price should be more than 2");
            else
            {
                productsList.Add(product);
                return "Product added successfully";
            }
        }
        #endregion
        #region Get Methods
        public List<ProductsModel> GetAllProducts()
        {
            return productsList;
        }

        public ProductsModel GetProductByID(int id)
        {
            // LINQ
            // var p = from pr in productsList
            //         where pr.ProductID == id
            //         select pr;

            // Lambda
            var p = productsList.SingleOrDefault(pr => pr.ProductID == id);

            if (p != null) return p;
            else throw new Exception("Product not found in the system");
        }

        public int TotalProducts()
        {
            return productsList.Count;
        }

        public List<ProductsModel> GetProductsByCategory(string category)
        {
            // LINQ
            // var p = from pr in productsList
            //         where pr.CategoryName == category
            //         select pr;

            // Lambda
            var p = productsList.Where(pr => pr.CategoryName == category).ToList();

            if (p.Any()) return p;
            else throw new Exception($"Category '{category}' does not exsit");
        }
        #endregion
        #region Update Method
        public string UpdateProduct(ProductsModel product)
        {
            var p = productsList.FirstOrDefault(pr => pr.ProductID == product.ProductID);
            if (p != null)
            {
                p.ProductID = product.ProductID;
                p.ProductName = product.ProductName;
                p.CategoryName = product.CategoryName;
                p.Description = product.Description;
                p.Price = product.Price;

                return "Product updated";
            }
            else
            {
                return "Product not found";
            }

            // var index = productsList.FindIndex(pr => pr.ProductID == product.ProductID);
            // if (index == -1)
            // {
            //     return "Product not found";
            // }

            // productsList[index] = product;
            // return "Product updated";
        }
        #endregion
        #region Delete Method
        public string DeleteProduct(int id)
        {
            var p = productsList.Single(pr => pr.ProductID == id);

            if (p != null)
            {
                productsList.Remove(p);
                return "Product deleted successfully";
            }
            else
            {
                throw new Exception("Product not found in the system");
            }
        }
        #endregion
    }
}