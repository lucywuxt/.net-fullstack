using System.Diagnostics.Tracing;
using Banking;

// NOT allowed since Accounts is an abstract class
// Account c = new Accounts();

Savings s = new Savings();
s.AccountNum = 123;
s.AccountType = TypeOfAccount.Savings;
s.AccountHolderName = "Lucy";
s.Balance = 10000;
s.IsActive = true;

// better way - object initializer
Checking c = new Checking()
{
    AccountNum = 456,
    AccountType = TypeOfAccount.Checking,
    AccountHolderName = "Nikhil",
    Balance = 1,
    IsActive = true
};


try
{
    Console.WriteLine($"Avaliable Saving Balance {s.Balance}");
    Console.WriteLine($"Avaliable Checking Balance {c.Balance}");
    s.Withdraw(2000);
    c.InterestCalculator(0.02);
    Console.WriteLine($"Avaliable Saving Balance {s.Balance}");
    Console.WriteLine($"Avaliable Checking Balance {c.Balance}");
}
catch (Exception e)
{
    Console.WriteLine(e.Message);
}
