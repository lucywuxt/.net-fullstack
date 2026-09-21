using BankingApp.Models;
using Microsoft.EntityFrameworkCore;

namespace BankingApp.Data;

public class BankContext : DbContext
{
    private readonly string _connectionString;

    public BankContext(string connectionString)
    {
        _connectionString = connectionString;
    }

    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<BankTransaction> Transactions => Set<BankTransaction>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer(_connectionString);

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Admin>(e =>
        {
            e.HasIndex(a => a.Username).IsUnique();
            e.Property(a => a.Username).HasMaxLength(50).IsRequired();
            e.Property(a => a.PasswordHash).HasMaxLength(100).IsRequired();
        });

        mb.Entity<Customer>(e =>
        {
            e.HasIndex(c => c.Username).IsUnique();
            e.Property(c => c.Username).HasMaxLength(50).IsRequired();
            e.Property(c => c.PasswordHash).HasMaxLength(100).IsRequired();
            e.Property(c => c.FullName).HasMaxLength(100).IsRequired();
            e.Property(c => c.Email).HasMaxLength(100);
            e.Property(c => c.Phone).HasMaxLength(20);

            e.HasOne(c => c.Account)
             .WithOne(a => a.Customer)
             .HasForeignKey<Account>(a => a.CustomerId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<Account>(e =>
        {
            e.HasIndex(a => a.AccountNumber).IsUnique();
            e.Property(a => a.Balance).HasColumnType("decimal(18,2)");
            e.Property(a => a.AccountType).HasConversion<string>().HasMaxLength(20);

            e.HasMany(a => a.Transactions)
             .WithOne(t => t.Account)
             .HasForeignKey(t => t.AccountId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(a => a.ServiceRequests)
             .WithOne(s => s.Account)
             .HasForeignKey(s => s.AccountId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<BankTransaction>(e =>
        {
            e.Property(t => t.Amount).HasColumnType("decimal(18,2)");
            e.Property(t => t.BalanceAfter).HasColumnType("decimal(18,2)");
            e.Property(t => t.Type).HasConversion<string>().HasMaxLength(20);
            e.Property(t => t.Description).HasMaxLength(200);
        });

        mb.Entity<ServiceRequest>(e =>
        {
            e.Property(s => s.RequestType).HasMaxLength(50);
            e.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
        });
    }
}
