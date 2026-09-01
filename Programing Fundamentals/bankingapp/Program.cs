bool continueTransaction = true;
while (continueTransaction)
{

Console.WriteLine("!~~~~~~~Welcome to Bank of America~~~~~~~!");
Console.WriteLine("1. Create Account");
Console.WriteLine("2. Check Balance");
Console.WriteLine("3. Withdraw Funds");
Console.WriteLine("4. Deposit Funds");
Console.WriteLine("5. Transfer Funds");
Console.WriteLine("6. View Transaction History");
Console.WriteLine("7. Change ATM PIN");
Console.WriteLine("8. Request Loan");
Console.WriteLine("9. Exit");

int userChoice = Convert.ToInt32(Console.ReadLine());
switch(userChoice)
{
    case 1:
        Console.WriteLine("You have selected to create a new account.");
        break;
    case 2:
        Console.WriteLine("You have selected to check your balance.");
        break;
    case 3:
        Console.WriteLine("You have selected to withdraw funds.");
        break;
    case 4:
        Console.WriteLine("You have selected to deposit funds.");
        break;
    case 5:
        Console.WriteLine("You have selected to transfer funds.");
        break;
    case 6:
        Console.WriteLine("You have selected to view transaction history.");
        break;
    case 7:
        Console.WriteLine("You have selected to change your ATM PIN.");
        break;
    case 8:
        Console.WriteLine("You have selected to request a loan.");
        break;
    case 9:
        continueTransaction = false;
        Console.WriteLine("Thank you for using Bank of America. Goodbye!");
        break;
    default:
        Console.WriteLine("Invalid choice. Please select a valid option.");
        break;
}
Console.WriteLine("Press any key to continue... or 9 to exit.");
Console.ReadKey();
}