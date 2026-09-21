using CoffeeShopApp.Data;
using CoffeeShopApp.Models;
using Microsoft.EntityFrameworkCore;

using var context = new CoffeeShopContext();
context.Database.Migrate(); // creates coffeeshop.db and applies any pending migrations

Console.WriteLine("=== Coffee Shop Manager ===");

bool exit = false;
while (!exit)
{
    PrintMenu();
    var choice = Console.ReadLine();

    switch (choice)
    {
        case "1": ListCategories(); break;
        case "2": AddCategory(); break;
        case "3": ListProducts(); break;
        case "4": AddProduct(); break;
        case "5": ListCustomers(); break;
        case "6": AddCustomer(); break;
        case "7": PlaceOrder(); break;
        case "8": ViewOrders(); break;
        case "0": exit = true; break;
        default: Console.WriteLine("Invalid option, try again."); break;
    }
}

void PrintMenu()
{
    Console.WriteLine();
    Console.WriteLine("1. List Categories");
    Console.WriteLine("2. Add Category");
    Console.WriteLine("3. List Products");
    Console.WriteLine("4. Add Product");
    Console.WriteLine("5. List Customers");
    Console.WriteLine("6. Add Customer");
    Console.WriteLine("7. Place Order");
    Console.WriteLine("8. View Orders");
    Console.WriteLine("0. Exit");
    Console.Write("Choose an option: ");
}

void ListCategories()
{
    var categories = context.Categories.Include(c => c.Products).ToList();
    Console.WriteLine();
    foreach (var c in categories)
        Console.WriteLine($"[{c.CategoryId}] {c.Name} ({c.Products.Count} products)");
}

void AddCategory()
{
    Console.Write("Category name: ");
    var name = Console.ReadLine() ?? "";
    context.Categories.Add(new Category { Name = name });
    context.SaveChanges();
    Console.WriteLine("Category added.");
}

void ListProducts()
{
    var products = context.Products.Include(p => p.Category).ToList();
    Console.WriteLine();
    foreach (var p in products)
        Console.WriteLine($"[{p.ProductId}] {p.Name} - ${p.Price:F2} ({p.Category?.Name}){(p.IsAvailable ? "" : " (unavailable)")}");
}

void AddProduct()
{
    ListCategories();
    Console.Write("Category Id: ");
    if (!int.TryParse(Console.ReadLine(), out int categoryId)) { Console.WriteLine("Invalid input."); return; }

    Console.Write("Product name: ");
    var name = Console.ReadLine() ?? "";

    Console.Write("Price: ");
    if (!decimal.TryParse(Console.ReadLine(), out decimal price)) { Console.WriteLine("Invalid input."); return; }

    context.Products.Add(new Product { Name = name, Price = price, CategoryId = categoryId });
    context.SaveChanges();
    Console.WriteLine("Product added.");
}

void ListCustomers()
{
    var customers = context.Customers.ToList();
    Console.WriteLine();
    foreach (var c in customers)
        Console.WriteLine($"[{c.CustomerId}] {c.Name} - {c.Email} - {c.Phone}");
}

void AddCustomer()
{
    Console.Write("Customer name: ");
    var name = Console.ReadLine() ?? "";
    Console.Write("Email: ");
    var email = Console.ReadLine();
    Console.Write("Phone: ");
    var phone = Console.ReadLine();

    context.Customers.Add(new Customer { Name = name, Email = email, Phone = phone });
    context.SaveChanges();
    Console.WriteLine("Customer added.");
}

void PlaceOrder()
{
    ListCustomers();
    Console.Write("Customer Id: ");
    if (!int.TryParse(Console.ReadLine(), out int customerId)) { Console.WriteLine("Invalid input."); return; }

    var customer = context.Customers.Find(customerId);
    if (customer == null) { Console.WriteLine("Customer not found."); return; }

    var order = new Order { CustomerId = customerId, OrderDate = DateTime.Now, Status = "Pending" };

    bool addingItems = true;
    while (addingItems)
    {
        ListProducts();
        Console.Write("Product Id to add (0 to finish order): ");
        if (!int.TryParse(Console.ReadLine(), out int productId)) { Console.WriteLine("Invalid input."); continue; }
        if (productId == 0) { addingItems = false; continue; }

        var product = context.Products.Find(productId);
        if (product == null) { Console.WriteLine("Product not found."); continue; }

        Console.Write("Quantity: ");
        if (!int.TryParse(Console.ReadLine(), out int qty) || qty <= 0) { Console.WriteLine("Invalid quantity."); continue; }

        order.OrderItems.Add(new OrderItem { ProductId = productId, Quantity = qty, UnitPrice = product.Price });
        Console.WriteLine($"Added {qty} x {product.Name}");
    }

    if (order.OrderItems.Count == 0) { Console.WriteLine("Order cancelled — no items added."); return; }

    context.Orders.Add(order);
    context.SaveChanges();
    Console.WriteLine($"Order #{order.OrderId} placed. Total: ${order.TotalAmount:F2}");
}

void ViewOrders()
{
    var orders = context.Orders
        .Include(o => o.Customer)
        .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
        .OrderByDescending(o => o.OrderDate)
        .ToList();

    foreach (var o in orders)
    {
        Console.WriteLine();
        Console.WriteLine($"Order #{o.OrderId} - {o.Customer?.Name} - {o.OrderDate:g} - {o.Status}");
        foreach (var item in o.OrderItems)
            Console.WriteLine($"   {item.Quantity} x {item.Product?.Name} @ ${item.UnitPrice:F2}");
        Console.WriteLine($"   Total: ${o.TotalAmount:F2}");
    }
}
