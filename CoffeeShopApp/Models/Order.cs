using System.ComponentModel.DataAnnotations.Schema;

namespace CoffeeShopApp.Models;

public class Order
{
    public int OrderId { get; set; }

    // Foreign key + navigation to Customer
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.Now;
    public string Status { get; set; } = "Pending"; // Pending, Completed, Cancelled

    // Navigation: one order has many line items
    public List<OrderItem> OrderItems { get; set; } = new();

    // Computed, not stored in the database
    [NotMapped]
    public decimal TotalAmount => OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice);
}
