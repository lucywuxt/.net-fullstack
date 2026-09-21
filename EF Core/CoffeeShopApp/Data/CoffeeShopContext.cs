using CoffeeShopApp.Models;
using Microsoft.EntityFrameworkCore;

namespace CoffeeShopApp.Data;

public class CoffeeShopContext : DbContext
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // SQLite keeps setup to a single file — no server install needed.
            // To use SQL Server instead, swap this line for:
            // optionsBuilder.UseSqlServer("Server=.;Database=CoffeeShopDb;Trusted_Connection=True;TrustServerCertificate=True");
            optionsBuilder.UseSqlite("Data Source=coffeeshop.db");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(8,2)");

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasColumnType("decimal(8,2)");

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Customer)
            .WithMany(c => c.Orders)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed data so the app has something to browse on first run
        modelBuilder.Entity<Category>().HasData(
            new Category { CategoryId = 1, Name = "Hot Coffee" },
            new Category { CategoryId = 2, Name = "Cold Coffee" },
            new Category { CategoryId = 3, Name = "Pastries" }
        );

        modelBuilder.Entity<Product>().HasData(
            new Product { ProductId = 1, Name = "Espresso", Price = 3.00m, CategoryId = 1, IsAvailable = true },
            new Product { ProductId = 2, Name = "Cappuccino", Price = 4.00m, CategoryId = 1, IsAvailable = true },
            new Product { ProductId = 3, Name = "Iced Latte", Price = 4.50m, CategoryId = 2, IsAvailable = true },
            new Product { ProductId = 4, Name = "Cold Brew", Price = 4.25m, CategoryId = 2, IsAvailable = true },
            new Product { ProductId = 5, Name = "Croissant", Price = 3.25m, CategoryId = 3, IsAvailable = true }
        );
    }
}
