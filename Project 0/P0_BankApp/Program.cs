using System;
using System.Security;
using Accounts;

// Account accObj = new Account() { accNo = 105, username = "Joe", password = "105", accBalance = 0.0 };
// accObj.SaveObject();

bool conintuation = true;
bool sub_menu_conintuation = true;
int accNum = 0;
Account accObj = null;

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

            try
            {
                accObj = Account.LoadObject(username, password);
                while (sub_menu_conintuation)
                {
                    ShowBankOptions();
                    accObj.SaveObject();
                }
                sub_menu_conintuation = true;
            }
            catch (FileNotFoundException ex)
            {
                Console.WriteLine("Invalid credentials.");
                Pause();
                ShowMainMenu();
            }
            break;

        case 2:
            Console.WriteLine("Admin????");
            Pause();
            break;

        case 3:
            Console.WriteLine("Thanks for banking with us!");
            conintuation = false;
            accObj.SaveObject();
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
            Console.WriteLine("~~~~~~~~~~~~ Account Detials ~~~~~~~~~~~~");
            Console.WriteLine(accObj.ToString());
            Pause();
            break;

        case 2:
            Console.WriteLine("~~~~~~~~~~~~ Withdraw ~~~~~~~~~~~~");
            Console.WriteLine("Enter amount to withdraw: ");
            double withdrawAmount = int.Parse(Console.ReadLine());
            accObj.Withdraw(withdrawAmount);
            Console.WriteLine($"The new balance is: {accObj.accBalance}");
            Pause();
            break;

        case 3:
            Console.WriteLine("~~~~~~~~~~~~ Deposit ~~~~~~~~~~~~");
            Console.WriteLine("Enter amount to deposit: ");
            double depositAmount = int.Parse(Console.ReadLine());
            accObj.Deposit(depositAmount);
            Console.WriteLine($"The new balance is: {accObj.accBalance}");
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
            sub_menu_conintuation = false;
            break;

        default:
            Console.WriteLine("Invalid choice.");
            Pause();
            ShowBankOptions();
            break;
    }
}


static void Pause()
{
    Console.WriteLine("Press any key to continue");
    Console.ReadKey();
}

// bool Authentication(string username, string password)
// {
//     return accObj.username == username && accObj.password == password;
// }