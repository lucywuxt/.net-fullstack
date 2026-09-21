using BankingApp.Data;
using BankingApp.Helpers;
using BankingApp.Models;

namespace BankingApp.Menus;

public class CustomerMenu : MenuBase
{
    private readonly BankContext _db;
    private readonly Customer _customer;

    public CustomerMenu(BankContext db, Customer customer)
    {
        _db = db;
        _customer = customer;
    }

    private Account Account => _customer.Account!;

    protected override void Display()
    {
        Console.WriteLine();
        Console.WriteLine($"----- Customer Menu ({_customer.FullName}) -----");
        Console.WriteLine("1. Check Account Details");
        Console.WriteLine("2. Withdraw");
        Console.WriteLine("3. Deposit");
        Console.WriteLine("4. Transfer");
        Console.WriteLine("5. Last 5 transactions");
        Console.WriteLine("6. Request Cheque Book");
        Console.WriteLine("7. Change Password");
        Console.WriteLine("8. Exit");
    }

    protected override bool Handle(string choice)
    {
        switch (choice)
        {
            case "1": ShowDetails(); break;
            case "2": Withdraw(); break;
            case "3": Deposit(); break;
            case "4": Transfer(); break;
            case "5": ShowLastTransactions(); break;
            case "6": RequestChequeBook(); break;
            case "7": ChangePassword(); break;
            case "8": return false;
            default: Console.WriteLine("Invalid choice."); break;
        }
        return true;
    }

    private void ShowDetails()
    {
        ConsoleHelper.Header("Account Details");
        Console.WriteLine($"Name           : {_customer.FullName}");
        Console.WriteLine($"Account Number : {Account.AccountNumber}");
        Console.WriteLine($"Account Type   : {Account.AccountType}");
        Console.WriteLine($"Balance        : {Account.Balance:C}");
        Console.WriteLine($"Email          : {_customer.Email}");
        Console.WriteLine($"Phone          : {_customer.Phone}");
    }

    private void Withdraw()
    {
        if (!ConsoleHelper.TryReadDecimal("Enter amount to withdraw: ", out var amount))
        {
            Console.WriteLine("Invalid amount.");
            return;
        }

        try
        {
            Account.Withdraw(amount);
            _db.SaveChanges();
            Console.WriteLine($"Withdrawal successful. New balance: {Account.Balance:C}");
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            Console.WriteLine($"Withdrawal failed: {ex.Message}");
        }
    }

    private void Deposit()
    {
        if (!ConsoleHelper.TryReadDecimal("Enter amount to deposit: ", out var amount))
        {
            Console.WriteLine("Invalid amount.");
            return;
        }

        try
        {
            Account.Deposit(amount);
            _db.SaveChanges();
            Console.WriteLine($"Deposit successful. New balance: {Account.Balance:C}");
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Deposit failed: {ex.Message}");
        }
    }

    private void Transfer()
    {
        if (!ConsoleHelper.TryReadInt("Enter destination account number: ", out var toNumber))
        {
            Console.WriteLine("Invalid account number.");
            return;
        }

        var target = _db.Accounts.FirstOrDefault(a => a.AccountNumber == toNumber);
        if (target is null)
        {
            Console.WriteLine("Destination account not found.");
            return;
        }

        if (!ConsoleHelper.TryReadDecimal("Enter amount to transfer: ", out var amount))
        {
            Console.WriteLine("Invalid amount.");
            return;
        }

        try
        {
            Account.TransferTo(target, amount);
            _db.SaveChanges();   // both sides are saved in a single database transaction
            Console.WriteLine($"Transfer successful. New balance: {Account.Balance:C}");
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            Console.WriteLine($"Transfer failed: {ex.Message}");
        }
    }

    private void ShowLastTransactions()
    {
        var txns = _db.Transactions
            .Where(t => t.AccountId == Account.Id)
            .OrderByDescending(t => t.Timestamp)
            .ThenByDescending(t => t.Id)
            .Take(5)
            .ToList();

        ConsoleHelper.Header("Last 5 Transactions");
        if (txns.Count == 0)
        {
            Console.WriteLine("No transactions found.");
            return;
        }

        Console.WriteLine($"{"Date",-18}{"Type",-13}{"Amount",12}{"Balance",14}  Description");
        foreach (var t in txns)
        {
            Console.WriteLine(
                $"{t.Timestamp.ToString("yyyy-MM-dd HH:mm"),-18}{t.Type,-13}{t.Amount,12:N2}{t.BalanceAfter,14:N2}  {t.Description}");
        }
    }

    private void RequestChequeBook()
    {
        var request = new ServiceRequest
        {
            AccountId = Account.Id,
            RequestType = "Cheque Book",
            Status = RequestStatus.Pending
        };

        _db.ServiceRequests.Add(request);
        _db.SaveChanges();

        Console.WriteLine($"Cheque book requested. Your request ID is: {request.Id}");
    }

    private void ChangePassword()
    {
        var oldPwd = ConsoleHelper.ReadPassword("Enter current password: ");
        if (PasswordHasher.Hash(oldPwd) != _customer.PasswordHash)
        {
            Console.WriteLine("Current password is incorrect.");
            return;
        }

        var newPwd = ConsoleHelper.ReadPassword("Enter new password: ");
        var confirm = ConsoleHelper.ReadPassword("Confirm new password: ");

        if (string.IsNullOrWhiteSpace(newPwd) || newPwd != confirm)
        {
            Console.WriteLine("Passwords do not match (or are empty). Password not changed.");
            return;
        }

        _customer.PasswordHash = PasswordHasher.Hash(newPwd);
        _db.SaveChanges();
        Console.WriteLine("Password changed successfully.");
    }
}
