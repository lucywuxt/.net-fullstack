using System.Security.Cryptography.X509Certificates;
using SavingsAccount;

List<Account> accList = new List<Account>();
accList.Add(new Account() { accNo = 001, accName = "Joker", accBalance = 0.0, accIsActive = true, accBranch = "DC" });
accList.Add(new Account() { accNo = 002, accName = "Johnas", accBalance = 0.0, accIsActive = true, accBranch = "MD" });
accList.Add(new Account() { accNo = 003, accName = "Joy", accBalance = 0.0, accIsActive = false, accBranch = "MA" });
accList.Add(new Account() { accNo = 004, accName = "Joshua", accBalance = 0.0, accIsActive = true, accBranch = "MI" });
accList.Add(new Account() { accNo = 005, accName = "Joe", accBalance = 0.0, accIsActive = true, accBranch = "IL" });
accList.Add(new Account() { accNo = 006, accName = "Jannie", accBalance = 0.0, accIsActive = true, accBranch = "CA" });
accList.Add(new Account() { accNo = 007, accName = "Joana", accBalance = 0.0, accIsActive = true, accBranch = "TN" });
accList.Add(new Account() { accNo = 008, accName = "Jane", accBalance = 0.0, accIsActive = true, accBranch = "TX" });
accList.Add(new Account() { accNo = 009, accName = "Just Kidding", accBalance = 0.0, accIsActive = true, accBranch = "CA" });
accList.Add(new Account() { accNo = 010, accName = "Justin", accBalance = 0.0, accIsActive = false, accBranch = "WA" });
accList.Add(new Account() { accNo = 011, accName = "John", accBalance = 0.0, accIsActive = true, accBranch = "AL" });
accList.Add(new Account() { accNo = 012, accName = "Joseph", accBalance = 0.0, accIsActive = true, accBranch = "AK" });
accList.Add(new Account() { accNo = 013, accName = "Josephine", accBalance = 0.0, accIsActive = true, accBranch = "FL" });
accList.Add(new Account() { accNo = 014, accName = "Josephina", accBalance = 0.0, accIsActive = true, accBranch = "NC" });
accList.Add(new Account() { accNo = 015, accName = "Joie", accBalance = 0.0, accIsActive = true, accBranch = "SC" });

int counter = 15;

bool conintuation = true;
int accNum = 0;
while (conintuation)
{
    ShowMainMenu();
    int choice = int.Parse(Console.ReadLine());
    
    switch (choice)
    {
        case 1:
            AddNewAccount();
            break;
        case 2:
            Console.WriteLine("~~~~~~~~~~~~All Accounts~~~~~~~~~~~~");
            foreach (var a in accList)
            {
                Console.WriteLine(a.ToString());
            }

            // Console.WriteLine(accList.ToString());
            break;
        
        case 3:
            Console.WriteLine("Enter account number: ");
            accNum = int.Parse(Console.ReadLine());
            Console.WriteLine("~~~~~~~~~~~~Account Detials~~~~~~~~~~~~");
            foreach (var a in accList)
            {
                if (a.accNo == accNum)
                    Console.WriteLine(a.ToString());
            }
            break;

        case 4:
            Console.WriteLine("~~~~~~~~~~~~Withdraw~~~~~~~~~~~~");
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
            break;

        case 5:
            Console.WriteLine("~~~~~~~~~~~~Deposit~~~~~~~~~~~~");
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
            break;

        case 6:
            ShowSummary();
            break;

        case 7:
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
    Console.WriteLine("!~~~~~~~~~ Banking w/ List ~~~~~~~~~!");
    Console.WriteLine("1. Add new account");
    Console.WriteLine("2. View all account detials");
    Console.WriteLine("3. View 1 account");
    Console.WriteLine("4. Withdraw");
    Console.WriteLine("5. Deposit");
    Console.WriteLine("6. Transfer");
    Console.WriteLine("7. Summary");
    Console.WriteLine("8. Exit");
}

void ShowSummary()
{
    Console.Clear();
    Console.WriteLine("!~~~~~~~~~ Summary ~~~~~~~~~!");
    Console.WriteLine("a. Total accounts");
    Console.WriteLine("b. Total balance");
    Console.WriteLine("c. Total active accounts");
    Console.WriteLine("d. Total inactive accounts");
    Console.WriteLine("e. Back to privious menu");

    double totalBalance = 0;
    int totalActiveAccs = 0;
    int totalInactiveAccs = 0;
    foreach (var a in accList)
    {
        totalBalance += a.accBalance;

        if (a.accIsActive)
        {
            totalActiveAccs++;
        }
        else
        {
            totalInactiveAccs++;
        }
    }

    string choice = Console.ReadLine();
    switch (choice)
    {
        case "a":
            Console.WriteLine($"Totoal accounts: {accList.Count}");
            break;
        case "b":
            Console.WriteLine($"Totoal balance: {totalBalance}");
            break;
        case "c":
            Console.WriteLine($"Totoal active accounts: {totalActiveAccs}");
            break;
        case "d":
            Console.WriteLine($"Totoal inactive accounts: {totalInactiveAccs}");
            break;
        case "e":
            ShowMainMenu();
            break;
        default:
            Console.WriteLine("Invalid choice.");
            Pause();
            break;
    }
}

void AddNewAccount()
{
    Console.WriteLine("Enter name: ");
    string name = Console.ReadLine();
    Console.WriteLine("Enter branch: ");
    string branch = Console.ReadLine();

    accList.Add(new Account() { accNo = counter, accName = name, accBalance = 0.0, accIsActive = true, accBranch = branch });
    counter++;
}

static void Pause()
{
    Console.WriteLine("Press any key to continue");
    Console.ReadKey();
}