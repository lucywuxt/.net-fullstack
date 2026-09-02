using OOPS_bankingAPP;

Accounts acc1 = new Accounts()
{
    AccNum = 101,
    AccName = "Lucy",
    AccBalance = 5.00,
    Email = "lucy@gmail.com",
    IsActive = true
};

Console.WriteLine($"Account Balance: ${acc1.AccBalance}");
Console.WriteLine("Choose an option: \n1. Deposit \n2. Withdraw");
int choice = int.Parse(Console.ReadLine());

switch (choice)
{    
    case 1:
        Console.WriteLine("Enter amount to deposit: ");
        double depositAmount = double.Parse(Console.ReadLine());

        acc1.Deposit(depositAmount);
        Console.WriteLine($"Deposit successful. New balance: ${acc1.AccBalance}");

        break;

    case 2:
        Console.WriteLine("Enter amount to withdraw: ");
        double withdrawAmount = double.Parse(Console.ReadLine());

        acc1.Withdraw(withdrawAmount);
        Console.WriteLine($"Withdrawal successful. New balance: ${acc1.AccBalance}");

        break;

    default:
        Console.WriteLine("Invalid choice.");
        break;
}