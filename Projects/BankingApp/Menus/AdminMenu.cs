using BankingApp.Data;
using BankingApp.Helpers;
using BankingApp.Models;
using Microsoft.EntityFrameworkCore;

namespace BankingApp.Menus;

public class AdminMenu : MenuBase
{
    private readonly BankContext _db;

    public AdminMenu(BankContext db) => _db = db;

    protected override void Display()
    {
        Console.WriteLine();
        Console.WriteLine("----- Admin Menu -----");
        Console.WriteLine("1. Create New Account");
        Console.WriteLine("2. Delete Account");
        Console.WriteLine("3. Edit Account Details");
        Console.WriteLine("4. Display Summary");
        Console.WriteLine("5. Reset Customer Password");
        Console.WriteLine("6. Approve Cheque book request");
        Console.WriteLine("7. Exit");
    }

    protected override bool Handle(string choice)
    {
        switch (choice)
        {
            case "1": CreateAccount(); break;
            case "2": DeleteAccount(); break;
            case "3": EditAccount(); break;
            case "4": ShowSummary(); break;
            case "5": ResetPassword(); break;
            case "6": ApproveChequeRequests(); break;
            case "7": return false;
            default: Console.WriteLine("Invalid choice."); break;
        }
        return true;
    }

    // ---------- 1. Create ----------
    private void CreateAccount()
    {
        ConsoleHelper.Header("Create New Account");

        var fullName = ConsoleHelper.ReadLine("Full name: ");
        if (string.IsNullOrWhiteSpace(fullName))
        {
            Console.WriteLine("Name is required.");
            return;
        }

        var username = ConsoleHelper.ReadLine("Username: ");
        if (string.IsNullOrWhiteSpace(username))
        {
            Console.WriteLine("Username is required.");
            return;
        }
        if (_db.Customers.Any(c => c.Username == username))
        {
            Console.WriteLine("That username already exists.");
            return;
        }

        var password = ConsoleHelper.ReadPassword("Initial password: ");
        if (string.IsNullOrWhiteSpace(password))
        {
            Console.WriteLine("Password is required.");
            return;
        }

        var email = ConsoleHelper.ReadLine("Email: ");
        var phone = ConsoleHelper.ReadLine("Phone: ");

        var typeChoice = ConsoleHelper.ReadLine("Account type (1 = Savings, 2 = Current): ");
        var type = typeChoice == "2" ? AccountType.Current : AccountType.Savings;

        if (!ConsoleHelper.TryReadDecimal("Opening deposit (0 for none): ", out var opening) || opening < 0)
        {
            Console.WriteLine("Invalid opening deposit.");
            return;
        }

        var nextNumber = (_db.Accounts.Max(a => (int?)a.AccountNumber) ?? 1000) + 1;

        var customer = new Customer
        {
            Username = username,
            PasswordHash = PasswordHasher.Hash(password),
            FullName = fullName,
            Email = email,
            Phone = phone
        };

        var account = new Account
        {
            AccountNumber = nextNumber,
            AccountType = type,
            Customer = customer
        };

        if (opening > 0)
            account.Deposit(opening, "Opening balance");

        _db.Accounts.Add(account);
        _db.SaveChanges();

        Console.WriteLine($"Account created. Account number: {account.AccountNumber}");
    }

    // ---------- 2. Delete ----------
    private void DeleteAccount()
    {
        var account = FindAccountByNumber();
        if (account is null) return;

        Console.WriteLine($"Account {account.AccountNumber} - {account.Customer!.FullName} - Balance {account.Balance:C}");
        if (!ConsoleHelper.Confirm("Delete this account and its customer record?"))
        {
            Console.WriteLine("Cancelled.");
            return;
        }

        _db.Customers.Remove(account.Customer);   // cascades to account, transactions, requests
        _db.SaveChanges();
        Console.WriteLine("Account deleted.");
    }

    // ---------- 3. Edit ----------
    private void EditAccount()
    {
        var account = FindAccountByNumber();
        if (account is null) return;

        var customer = account.Customer!;
        Console.WriteLine("Press Enter to keep the current value.");

        var name = ConsoleHelper.ReadLine($"Full name [{customer.FullName}]: ");
        var email = ConsoleHelper.ReadLine($"Email [{customer.Email}]: ");
        var phone = ConsoleHelper.ReadLine($"Phone [{customer.Phone}]: ");
        var type = ConsoleHelper.ReadLine($"Account type (1 = Savings, 2 = Current) [{account.AccountType}]: ");

        if (!string.IsNullOrWhiteSpace(name)) customer.FullName = name;
        if (!string.IsNullOrWhiteSpace(email)) customer.Email = email;
        if (!string.IsNullOrWhiteSpace(phone)) customer.Phone = phone;
        if (type == "1") account.AccountType = AccountType.Savings;
        if (type == "2") account.AccountType = AccountType.Current;

        _db.SaveChanges();
        Console.WriteLine("Account details updated.");
    }

    // ---------- 4. Summary ----------
    private void ShowSummary()
    {
        var accounts = _db.Accounts.Include(a => a.Customer).OrderBy(a => a.AccountNumber).ToList();

        ConsoleHelper.Header("Bank Summary");
        Console.WriteLine($"Total customers        : {accounts.Count}");
        Console.WriteLine($"Total deposits held    : {accounts.Sum(a => a.Balance):C}");
        Console.WriteLine($"Pending cheque requests: {_db.ServiceRequests.Count(s => s.Status == RequestStatus.Pending)}");
        Console.WriteLine();

        if (accounts.Count == 0) return;

        Console.WriteLine($"{"Acct #",-8}{"Name",-25}{"Username",-15}{"Type",-10}{"Balance",14}");
        foreach (var a in accounts)
        {
            Console.WriteLine(
                $"{a.AccountNumber,-8}{a.Customer!.FullName,-25}{a.Customer.Username,-15}{a.AccountType,-10}{a.Balance,14:N2}");
        }
    }

    // ---------- 5. Reset password ----------
    private void ResetPassword()
    {
        var account = FindAccountByNumber();
        if (account is null) return;

        var newPwd = ConsoleHelper.ReadPassword("Enter new password for the customer: ");
        if (string.IsNullOrWhiteSpace(newPwd))
        {
            Console.WriteLine("Password cannot be empty.");
            return;
        }

        account.Customer!.PasswordHash = PasswordHasher.Hash(newPwd);
        _db.SaveChanges();
        Console.WriteLine($"Password reset for {account.Customer.FullName}.");
    }

    // ---------- 6. Approve cheque book ----------
    private void ApproveChequeRequests()
    {
        var pending = _db.ServiceRequests
            .Include(s => s.Account).ThenInclude(a => a!.Customer)
            .Where(s => s.Status == RequestStatus.Pending && s.RequestType == "Cheque Book")
            .OrderBy(s => s.Id)
            .ToList();

        ConsoleHelper.Header("Pending Cheque Book Requests");
        if (pending.Count == 0)
        {
            Console.WriteLine("No pending requests.");
            return;
        }

        Console.WriteLine($"{"Req ID",-8}{"Acct #",-8}{"Customer",-25}{"Requested On",-18}");
        foreach (var r in pending)
        {
            Console.WriteLine(
                $"{r.Id,-8}{r.Account!.AccountNumber,-8}{r.Account.Customer!.FullName,-25}{r.RequestedOn:yyyy-MM-dd HH:mm}");
        }

        if (!ConsoleHelper.TryReadInt("Enter request ID to process (0 to go back): ", out var id) || id == 0)
            return;

        var request = pending.FirstOrDefault(r => r.Id == id);
        if (request is null)
        {
            Console.WriteLine("Request not found in the pending list.");
            return;
        }

        var action = ConsoleHelper.ReadLine("1 = Approve, 2 = Reject: ");
        if (action == "1")
            request.Status = RequestStatus.Approved;
        else if (action == "2")
            request.Status = RequestStatus.Rejected;
        else
        {
            Console.WriteLine("Invalid choice.");
            return;
        }

        request.ProcessedOn = DateTime.Now;
        _db.SaveChanges();
        Console.WriteLine($"Request {request.Id} {request.Status.ToString().ToLower()}.");
    }

    // ---------- helper ----------
    private Account? FindAccountByNumber()
    {
        if (!ConsoleHelper.TryReadInt("Enter account number: ", out var number))
        {
            Console.WriteLine("Invalid account number.");
            return null;
        }

        var account = _db.Accounts
            .Include(a => a.Customer)
            .FirstOrDefault(a => a.AccountNumber == number);

        if (account is null)
            Console.WriteLine("Account not found.");

        return account;
    }
}
