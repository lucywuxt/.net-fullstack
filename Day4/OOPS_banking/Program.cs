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
Savings s1 = new Savings()
{
    AccountNum = 456,
    AccountType = TypeOfAccount.Savings,
    AccountHolderName = "Nikhil",
    Balance = 1,
    IsActive = true
};

Console.WriteLine($"Avaliable Balance {s.Balance}");
try
{
    s.Withdraw(2000);
}
catch(Exception e)
{
    Console.WriteLine(e.Message);
}
Console.WriteLine($"Avaliable Balance {s.Balance}");