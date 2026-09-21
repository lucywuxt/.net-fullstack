using BankingApp.Data;
using BankingApp.Helpers;
using BankingApp.Menus;
using BankingApp.Services;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false)
    .Build();

var connectionString = config.GetConnectionString("BankDb")
    ?? throw new InvalidOperationException("Connection string 'BankDb' not found.");

using var db = new BankContext(connectionString);

try
{
    DbInitializer.Initialize(db);
}
catch (Exception ex)
{
    Console.WriteLine("Could not connect to / create the database:");
    Console.WriteLine(ex.InnerException?.Message ?? ex.Message);
    Console.WriteLine("Check the connection string in appsettings.json and that SQL Server is running.");
    return;
}

IAuthService auth = new AuthService(db);

while (true)
{
    Console.WriteLine();
    Console.WriteLine("=====================================");
    Console.WriteLine("        Welcome to the Bank");
    Console.WriteLine("=====================================");
    Console.WriteLine("1. Customer");
    Console.WriteLine("2. Admin");
    Console.WriteLine("3. Exit");
    Console.Write("Enter your choice: ");

    var choice = (Console.ReadLine() ?? string.Empty).Trim();

    switch (choice)
    {
        case "1":
        {
            var username = ConsoleHelper.ReadLine("Please enter username: ");
            var password = ConsoleHelper.ReadPassword("Please enter Password: ");

            var customer = auth.LoginCustomer(username, password);
            if (customer?.Account is null)
            {
                Console.WriteLine("Invalid Credential");
                break;   // back to the welcome screen
            }

            new CustomerMenu(db, customer).Run();
            break;
        }

        case "2":
        {
            var username = ConsoleHelper.ReadLine("Please enter username: ");
            var password = ConsoleHelper.ReadPassword("Please enter Password: ");

            var admin = auth.LoginAdmin(username, password);
            if (admin is null)
            {
                Console.WriteLine("Invalid Credential");
                break;
            }

            new AdminMenu(db).Run();
            break;
        }

        case "3":
            Console.WriteLine("Thank you for banking with us. Goodbye!");
            return;

        default:
            Console.WriteLine("Invalid choice");
            break;
    }
}
