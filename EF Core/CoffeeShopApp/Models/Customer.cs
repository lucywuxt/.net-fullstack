namespace CoffeeShopApp.Models;

public class Customer
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }

    // Navigation: one customer can have many orders
    public List<Order> Orders { get; set; } = new();
}
