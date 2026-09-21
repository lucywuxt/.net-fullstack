namespace CoffeeShopApp.Models;

public class Product
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;

    // Foreign key + navigation to Category
    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    // Navigation: a product can appear in many order items
    public List<OrderItem> OrderItems { get; set; } = new();
}
