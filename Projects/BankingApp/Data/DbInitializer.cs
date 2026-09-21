using BankingApp.Helpers;
using BankingApp.Models;

namespace BankingApp.Data;

public static class DbInitializer
{
    /// <summary>Creates the database if needed and seeds a default admin and a demo customer.</summary>
    public static void Initialize(BankContext db)
    {
        db.Database.EnsureCreated();

        if (!db.Admins.Any())
        {
            db.Admins.Add(new Admin
            {
                Username = "admin",
                PasswordHash = PasswordHasher.Hash("admin123")
            });
        }

        if (!db.Customers.Any())
        {
            var customer = new Customer
            {
                Username = "john",
                PasswordHash = PasswordHasher.Hash("john123"),
                FullName = "John Doe",
                Email = "john@example.com",
                Phone = "555-0100"
            };

            var account = new Account
            {
                AccountNumber = 1001,
                AccountType = AccountType.Savings,
                Customer = customer
            };
            account.Deposit(5000m, "Opening balance");

            db.Accounts.Add(account);
        }

        db.SaveChanges();
    }
}
