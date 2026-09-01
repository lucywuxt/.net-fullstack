bool continueProgram = true;

while (continueProgram)
{
    Console.Clear();
    ShowMainMenu();

    Console.Write("Please select an option: ");
    string userChoice = Console.ReadLine()?.ToLower() ?? "";

    switch (userChoice)
    {
        case "a":
            Console.WriteLine("Please enter your admin credentials.");
            Console.Write("Username: ");
            string adminUsername = Console.ReadLine();
            Console.Write("Password: ");
            string adminPassword = Console.ReadLine();
            // Admin authentication logic
            if (AuthenticateAdmin(adminUsername, adminPassword)){
                ShowAdminMenu();
            }
            else{
                Console.WriteLine("Invalid admin credentials.");
                Pause();
                ShowMainMenu();
            }
            break;
        case "b":
            Console.WriteLine("Please enter your employee credentials.");
            Console.Write("Username: ");
            string empUsername = Console.ReadLine();
            Console.Write("Password: ");
            string empPassword = Console.ReadLine();
            // Employee authentication logic
            if (AuthenticateEmployee(empUsername, empPassword)){
                ShowEmployeeMenu();
            }
            else{
                Console.WriteLine("Invalid employee credentials.");
                Pause();
                ShowMainMenu();
            }
            break;
        case "c":
            ShowGuestMenu();
            break;
        case "d":
            continueProgram = false;
            Console.WriteLine("Exiting the program. Goodbye!");
            break;
        default:
            Console.WriteLine("Invalid choice. Please select a valid option.");
            Pause();
            break;
    }
}

static void ShowMainMenu()
{
    Console.WriteLine("!~~~~~~~Welcome to Employee Management~~~~~~~!");
    Console.WriteLine("a. admin");
    Console.WriteLine("b. employee");
    Console.WriteLine("c. guest");
    Console.WriteLine("d. exit");
}

static void ShowAdminMenu()
{
    bool stayInMenu = true;

    while (stayInMenu)
    {
        Console.Clear();
        Console.WriteLine("Admin");
        Console.WriteLine("a. Create new employee");
        Console.WriteLine("b. Change employee details");
        Console.WriteLine("c. Announce Activity");
        Console.WriteLine("d. Delete Employee");
        Console.WriteLine("e. View All employees");
        Console.WriteLine("f. Back to previous menu");
        Console.WriteLine("g. Exit");

        Console.Write("Please select an option: ");
        string userChoice = Console.ReadLine()?.ToLower() ?? "";

        switch (userChoice)
        {
            case "a":
                Console.WriteLine("You have selected to create a new employee.");
                Pause();
                break;
            case "b":
                Console.WriteLine("You have selected to change employee details.");
                Pause();
                break;
            case "c":
                Console.WriteLine("You have selected to announce an activity.");
                Pause();
                break;
            case "d":
                Console.WriteLine("You have selected to delete an employee.");
                Pause();
                break;
            case "e":
                Console.WriteLine("You have selected to view all employees.");
                Pause();
                break;
            case "f":
                Console.WriteLine("Returning to previous menu...");
                Pause();
                stayInMenu = false;
                break;
            case "g":
                Console.WriteLine("Exiting the program. Goodbye!");
                Environment.Exit(0);
                break;
            default:
                Console.WriteLine("Invalid choice. Please select a valid option.");
                Pause();
                break;
        }
    }
}

static void ShowEmployeeMenu()
{
    bool stayInMenu = true;

    while (stayInMenu)
    {
        Console.Clear();
        Console.WriteLine("Employee");
        Console.WriteLine("a. View my details");
        Console.WriteLine("b. Apply leave");
        Console.WriteLine("c. Submit reimbursement");
        Console.WriteLine("d. View project details");
        Console.WriteLine("e. View today's task and activities");
        Console.WriteLine("f. Back to previous menu");
        Console.WriteLine("g. Exit");

        Console.Write("Please select an option: ");
        string userChoice = Console.ReadLine()?.ToLower() ?? "";

        switch (userChoice)
        {
            case "a":
                Console.WriteLine("You have selected to view your details.");
                Pause();
                break;
            case "b":
                Console.WriteLine("You have selected to apply for leave.");
                Pause();
                break;
            case "c":
                Console.WriteLine("You have selected to submit a reimbursement.");
                Pause();
                break;
            case "d":
                Console.WriteLine("You have selected to view project details.");
                Pause();
                break;
            case "e":
                Console.WriteLine("You have selected to view today's tasks and activities.");
                Pause();
                break;
            case "f":
                Console.WriteLine("Returning to previous menu...");
                Pause();
                stayInMenu = false;
                break;
            case "g":
                Console.WriteLine("Exiting the program. Goodbye!");
                Environment.Exit(0);
                break;
            default:
                Console.WriteLine("Invalid choice. Please select a valid option.");
                Pause();
                break;
        }
    }
}

static void ShowGuestMenu()
{
    bool stayInMenu = true;

    while (stayInMenu)
    {
        Console.Clear();
        Console.WriteLine("Guest");
        Console.WriteLine("a. About the organization");
        Console.WriteLine("b. View open positions");
        Console.WriteLine("c. Contact information");
        Console.WriteLine("d. Back to previous menu");
        Console.WriteLine("e. Exit");

        Console.Write("Please select an option: ");
        string userChoice = Console.ReadLine()?.ToLower() ?? "";

        switch (userChoice)
        {
            case "a":
                Console.WriteLine("You have selected to learn about the organization.");
                Pause();
                break;
            case "b":
                Console.WriteLine("You have selected to view open positions.");
                Pause();
                break;
            case "c":
                Console.WriteLine("You have selected to view contact information.");
                Pause();
                break;
            case "d":
                Console.WriteLine("Returning to previous menu...");
                Pause();
                stayInMenu = false;
                break;
            case "e":
                Console.WriteLine("Exiting the program. Goodbye!");
                Environment.Exit(0);
                break;
            default:
                Console.WriteLine("Invalid choice. Please select a valid option.");
                Pause();
                break;
        }
    }
}

static void Pause()
{
    Console.WriteLine("Press any key to continue");
    Console.ReadKey();
}

static bool AuthenticateAdmin(string username, string password)
{
    return username == "revadmin" && password == "revadmin$123#";
}

static bool AuthenticateEmployee(string username, string password)
{
    return username == "revemp2409" && password == "revadmin$123#emp";
}