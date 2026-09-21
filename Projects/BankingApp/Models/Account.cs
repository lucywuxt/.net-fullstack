namespace BankingApp.Models;

/// <summary>
/// Rich domain object: balance can only change through Deposit / Withdraw / TransferTo,
/// and each of those records a transaction (encapsulation).
/// </summary>
public class Account
{
    public int Id { get; set; }
    public int AccountNumber { get; set; }
    public AccountType AccountType { get; set; } = AccountType.Savings;
    public decimal Balance { get; private set; }

    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public List<BankTransaction> Transactions { get; set; } = new();
    public List<ServiceRequest> ServiceRequests { get; set; } = new();

    public void Deposit(decimal amount, string description = "Cash deposit")
    {
        ValidateAmount(amount);
        Balance += amount;
        AddTransaction(TransactionType.Deposit, amount, description);
    }

    public void Withdraw(decimal amount, string description = "Cash withdrawal")
    {
        ValidateAmount(amount);
        if (amount > Balance)
            throw new InvalidOperationException("Insufficient balance.");

        Balance -= amount;
        AddTransaction(TransactionType.Withdrawal, amount, description);
    }

    public void TransferTo(Account target, decimal amount)
    {
        ValidateAmount(amount);
        if (target.AccountNumber == AccountNumber)
            throw new InvalidOperationException("Cannot transfer to the same account.");
        if (amount > Balance)
            throw new InvalidOperationException("Insufficient balance.");

        Balance -= amount;
        AddTransaction(TransactionType.TransferOut, amount, $"Transfer to A/C {target.AccountNumber}");

        target.Balance += amount;
        target.AddTransaction(TransactionType.TransferIn, amount, $"Transfer from A/C {AccountNumber}");
    }

    private static void ValidateAmount(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be greater than zero.");
    }

    private void AddTransaction(TransactionType type, decimal amount, string description)
    {
        Transactions.Add(new BankTransaction
        {
            Type = type,
            Amount = amount,
            BalanceAfter = Balance,
            Description = description,
            Timestamp = DateTime.Now
        });
    }
}
