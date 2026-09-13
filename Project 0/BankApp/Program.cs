using System;
using System.Security;
using Accounts;

List<Account> accList = new List<Account>();
accList.Add(new Account() { accNo = 001, username = "Joker", accBalance = 100.0 });
accList.Add(new Account() { accNo = 002, username = "Johnas", accBalance = 0.0 });
accList.Add(new Account() { accNo = 003, username = "Joy", accBalance = 0.0, });
accList.Add(new Account() { accNo = 004, username = "Joshua", accBalance = 0.0 });
accList.Add(new Account() { accNo = 005, username = "Joe", accBalance = 0.0 });

int counter = 5;

bool conintuation = true;
int accNum = 0;
while (conintuation)
{
    ShowMainMenu();
    int choice = int.Parse(Console.ReadLine());

    switch (choice)
    {
        case 1:
            Console.WriteLine("Please enter username:");
            string username = Console.ReadLine();
            Console.WriteLine("Please enter password:");
            string password = Console.ReadLine();

            if (Authentication(username, password))
            {
                ShowBankOptions();
            }
            else
            {
                Console.WriteLine("Invalid credentials.");
                Pause();
                ShowMainMenu();
            }
            break;

        case 2:
            Console.WriteLine("Admin????");
            break;

        case 3:
            Console.WriteLine("Thanks for banking with us!");
            conintuation = false;
            break;

        default:
            Console.WriteLine("Invalid choice.");
            Pause();
            break;
    }
}


static void ShowMainMenu()
{
    Console.Clear();
    Console.WriteLine("!~~~~~~~~~ Welcome to Banking App ~~~~~~~~~!");
    Console.WriteLine("1. Customer");
    Console.WriteLine("2. Admin");
    Console.WriteLine("3. Exit");
}

void ShowBankOptions()
{
    Console.Clear();
    Console.WriteLine("!~~~~~~~~~ Banking Options ~~~~~~~~~!");
    Console.WriteLine("1. Check Account Details");
    Console.WriteLine("2. Withdraw");
    Console.WriteLine("3. Deposit");
    Console.WriteLine("4. Transfer");
    Console.WriteLine("5. Last 5 Transactions");
    Console.WriteLine("6. Request Cheque Book");
    Console.WriteLine("7. Change Password");
    Console.WriteLine("8. Exit");

    int choice = int.Parse(Console.ReadLine());

    switch (choice)
    {

        case 1:
            Console.WriteLine("Enter account number: ");
            accNum = int.Parse(Console.ReadLine());
            Console.WriteLine("~~~~~~~~~~~~ Account Detials ~~~~~~~~~~~~");
            foreach (var a in accList)
            {
                if (a.accNo == accNum)
                    Console.WriteLine(a.ToString());
            }
            Pause();
            break;

        case 2:
            Console.WriteLine("~~~~~~~~~~~~ Withdraw ~~~~~~~~~~~~");
            Console.WriteLine("Enter account number: ");
            accNum = int.Parse(Console.ReadLine());
            Console.WriteLine("Enter amount to withdraw: ");
            double withdrawAmount = int.Parse(Console.ReadLine());
            foreach (var a in accList)
            {
                if (a.accNo == accNum)
                {
                    a.Withdraw(withdrawAmount);
                    Console.WriteLine($"The new balance is: {a.accBalance}");
                }
            }
            Pause();
            break;

        case 3:
            Console.WriteLine("~~~~~~~~~~~~ Deposit ~~~~~~~~~~~~");
            Console.WriteLine("Enter account number: ");
            accNum = int.Parse(Console.ReadLine());
            Console.WriteLine("Enter amount to deposit: ");
            double depositAmount = int.Parse(Console.ReadLine());
            foreach (var a in accList)
            {
                if (a.accNo == accNum)
                {
                    a.Deposit(depositAmount);
                    Console.WriteLine($"The new balance is: {a.accBalance}");
                }
            }
            Pause();
            break;

        case 4:
            Console.WriteLine("~~~~~~~~~~~~ Transfer ~~~~~~~~~~~~");
            // Console.WriteLine("Enter account to transfer from: ");
            // fromAccNum = int.Parse(Console.ReadLine());

            // Console.WriteLine("Enter account to transfer to: ");
            // toAccNum = int.Parse(Console.ReadLine());

            // Console.WriteLine("Enter amount to transfer: ");
            // double transferAmount = double.Parse(Console.ReadLine());

            // Transfer(fromAccNum, toAccNum, transferAmount);
            // Console.WriteLine("Transfer Successful!");
            Pause();
            break;

        case 5:
            Console.WriteLine("~~~~~~~~~~~~ Last 5 Transactions ~~~~~~~~~~~~");
            Pause();
            break;

        case 6:
            Console.WriteLine("~~~~~~~~~~~~ Request Cheque Book ~~~~~~~~~~~~");
            Pause();
            break;

        case 7:
            Console.WriteLine("~~~~~~~~~~~~ Change Password ~~~~~~~~~~~~");
            Pause();
            break;

        case 8:
            Console.WriteLine("Thanks for banking with us!");
            conintuation = false;
            break;

        default:
            Console.WriteLine("Invalid choice.");
            Pause();
            ShowBankOptions();
            break;
    }
}

// void AddNewAccount()
// {
//     Console.WriteLine("Enter name: ");
//     string name = Console.ReadLine();
//     Console.WriteLine("Enter branch: ");
//     string branch = Console.ReadLine();

//     accList.Add(new Account() { accNo = counter, username = name, accBalance = 0.0 });
//     counter++;
// }

static void Pause()
{
    Console.WriteLine("Press any key to continue");
    Console.ReadKey();
}

static bool Authentication(string username, string password)
{
    return username == "111" && password == "123";
}