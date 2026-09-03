using System.Diagnostics.Tracing;
using System.Security.Principal;
using Banking;

#region Notes
// NOT allowed since Accounts is an abstract class
// Account c = new Accounts();

// Savings s = new Savings();
// s.AccountNum = 123;
// s.AccountType = TypeOfAccount.Savings;
// s.AccountHolderName = "Lucy";
// s.Balance = 10000;
// s.IsActive = true;

// // better way - object initializer
// Checking c = new Checking()
// {
// AccountNum = 456,
// AccountType = TypeOfAccount.Checking,
// AccountHolderName = "Nikhil",
// Balance = 1,
// IsActive = true,
// AccountOpenYear
// };

// try
// {
//     Console.WriteLine($"Avaliable Saving Balance {s.Balance}");
//     Console.WriteLine($"Avaliable Checking Balance {c.Balance}");
//     s.Withdraw(2000);
//     c.InterestCalculator(0.02);
//     Console.WriteLine($"Avaliable Saving Balance {s.Balance}");
//     Console.WriteLine($"Avaliable Checking Balance {c.Balance}");
// }
// catch (Exception e)
// {
//     Console.WriteLine(e.Message);
// }
#endregion

bool continueProgram = true;
while (continueProgram)
{
    ShowMainMenu();
    int choice = int.Parse(Console.ReadLine());
    switch (choice)
    {
        case 1:
            //create new account
            CreateNewAccount();
            Pause();
            break;

        case 2:
            // check balance
            ShowBalanceMenu();
            Pause();
            break;

        case 3:
            // exit
            Console.WriteLine("Thank you for using OOPS Banking.");
            continueProgram = false;
            break;

        default:
            Console.WriteLine("Invalid choice.");
            Pause();
            break;
    }

    static void ShowMainMenu()
    {
        Console.Clear();
        Console.WriteLine("!~~~~~~~~~ Polymorphism Banking ~~~~~~~~~!");
        Console.WriteLine("1. Create new account");
        Console.WriteLine("2. Check balance");
        Console.WriteLine("3. exit");
    }

    static void CreateNewAccount()
    {
        Console.WriteLine("Please enter your name:");
        string name = Console.ReadLine();

        Console.WriteLine("Please enter account type \n1. Savings \n2. Checking \n3. Loans \n4. Return to Main Menu");
        if (!int.TryParse(Console.ReadLine(), out int accountTypeChoice))
        {
            Console.WriteLine("Invalid account type.");
            return;
        }

        Accounts account;
        switch (accountTypeChoice)
        {
            case 1:
                account = new Savings();
                account.AccountType = TypeOfAccount.Savings;
                break;

            case 2:
                account = new Checking();
                account.AccountType = TypeOfAccount.Checking;
                break;

            case 3:
                account = new Loans();
                account.AccountType = TypeOfAccount.Loans;
                break;

            case 4:
                Console.WriteLine("Returning to the Main Menu");
                Pause();
                ShowMainMenu();
                return;

            default:
                Console.WriteLine("Invalid account type.");
                return;
        }

        account.AccountNum = Accounts.AccCounter;
        account.AccountHolderName = name;

        string formattedAccNum = account.AccountNum.ToString("D3");
        string fileName = $"{formattedAccNum}.txt";
        File.WriteAllText(fileName, account.ToString());

        Console.WriteLine($"New account created with account number: {formattedAccNum}");
        Accounts.AccCounter++;
    }

    static void ShowBalanceMenu()
    {
        Console.WriteLine("Please enter account number:");
        if (!int.TryParse(Console.ReadLine(), out int accountNumber))
        {
            Console.WriteLine("Invalid account number.");
            Pause();
            return;
        }

        string fileName = $"{accountNumber}.txt";
        if (!File.Exists(fileName))
        {
            Console.WriteLine("Account not found.");
            return;
        }

        string? balanceLine = File.ReadLines(fileName)
            .FirstOrDefault(line => line.StartsWith("Balance:"));

        string balance = balanceLine["Balance:".Length..].Trim();
        Console.WriteLine($"Account balance: {balance}");
    }

    static void Pause()
    {
        Console.WriteLine("Press any key to continue");
        Console.ReadKey();
    }
}