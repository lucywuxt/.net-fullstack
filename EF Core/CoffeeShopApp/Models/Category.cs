namespace CoffeeShopApp.Models;

public class Category
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;

    // Navigation property: one category has many products
    public List<Product> Products { get; set; } = new();
}
