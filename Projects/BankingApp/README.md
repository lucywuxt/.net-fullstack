# Banking Application (C# / .NET 8 / EF Core / SQL Server)

Console banking app with a Customer menu and an Admin menu.

## Run it (VS Code)

1. Install the **.NET 8 SDK** and the **C# Dev Kit** extension for VS Code.
2. Have SQL Server available. The default connection string in `appsettings.json` uses **LocalDB**
3. In the VS Code terminal:
   ```
   dotnet restore
   dotnet run
   ```
   The database and tables are created automatically on first run and seeded with:

| Role     | Username | Password | Notes                      |
|----------|----------|----------|----------------------------|
| Admin    | admin    | admin123 |                            |
| Customer | john     | john123  | Account 1001, balance 5000 |

## Project layout

```
Models/     Admin, Customer, Account, BankTransaction, ServiceRequest + enums
Data/       BankContext (EF Core DbContext), DbInitializer (create + seed)
Services/   IAuthService, AuthService
Menus/      MenuBase (abstract), CustomerMenu, AdminMenu
Helpers/    PasswordHasher, ConsoleHelper (masked password input, safe parsing)
Program.cs  Welcome screen and main loop
```

## OOP concepts used

- **Encapsulation**: `Account.Balance` has a private setter; only `Deposit`, `Withdraw`, `TransferTo` change it and each records a transaction.
- **Abstraction / Inheritance / Polymorphism**: `MenuBase` defines the menu loop; `CustomerMenu` and `AdminMenu` override `Display` and `Handle`.
- **Interfaces**: `IAuthService` implemented by `AuthService`.

## Using EF Core migrations instead of EnsureCreated (optional)

```
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update
```
`dotnet-ef` needs a design-time factory because `BankContext` takes a connection string in its constructor; the simplest approach is to keep `EnsureCreated()` for this exercise.
