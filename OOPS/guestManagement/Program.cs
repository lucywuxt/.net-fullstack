bool continueProgram = true;

while (continueProgram){

    ShowMainMenu();

    Console.Write("Please select an option: ");
    string userChoice = Console.ReadLine()?.ToLower() ?? "";

    switch (userChoice)
    {
        case "a":
            Console.Clear();
            Console.WriteLine("!~~~~~~~~Create New Guest~~~~~~~~!");
            ShowNewGuest();
            Pause();
            ShowMainMenu();
            break;
        case "b":
            Console.Clear();
            Console.WriteLine("!~~~~~~~~View Guest Details~~~~~~~~!");
            Console.WriteLine("Please enter your SSN");
                string userSSN = Console.ReadLine();
                // Read the guest details from the file
                string filePath = userSSN + ".txt";
                if (File.Exists(filePath)){
                    // string[] guestDetails = File.ReadAllLines(filePath);
                    // foreach (string detail in guestDetails){
                    //     Console.WriteLine(detail);
                    // }
                    Console.Clear();
                    Console.WriteLine("!~~~~~~~~Guest Details~~~~~~~~!");
                    FileStream file = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                    StreamReader reader = new StreamReader(file);
                    Console.WriteLine(reader.ReadToEnd());
                    reader.Close();
                }
                else{
                    Console.WriteLine("Guest details not found for SSN: " + userSSN);
                }
                Pause();
            break;
        case "c":
            continueProgram = false;
            Console.WriteLine("Exiting the program. Goodbye!");
            break;
        default:
            Console.WriteLine("Invalid option. Please try again.");
            // Pause();
            break;
    }


    static void ShowMainMenu()
    {
        Console.Clear();
        Console.WriteLine("!~~~~~~~Welcome to Guest Management~~~~~~~!");
        Console.WriteLine("a. New Guest");
        Console.WriteLine("b. View Guest Details");
        Console.WriteLine("c. exit");
    }

    static void ShowNewGuest()
    {
        Console.WriteLine("Please enter your first name:");
        String firstName = Console.ReadLine();

        Console.WriteLine("Please enter your last name:");
        String lastName = Console.ReadLine();

        Console.WriteLine("Please enter your email:");
        String email = Console.ReadLine();

        Console.WriteLine("Please enter your phone number:");
        String phoneNo = Console.ReadLine();

        Console.WriteLine("Please enter your social security number:");
        String ssn = Console.ReadLine();

        Console.WriteLine("Please enter any notes:");
        String notes = Console.ReadLine();

        FileStream file = new FileStream(ssn + ".txt", FileMode.Create, FileAccess.ReadWrite);
        StreamWriter writer = new StreamWriter(file);

        writer.WriteLine("SSN: " + ssn);
        writer.WriteLine("First Name: " + firstName);
        writer.WriteLine("Last Name: " + lastName);
        writer.WriteLine("Email: " + email);
        writer.WriteLine("Phone: " + phoneNo);
        writer.WriteLine("Notes: " + notes);

        writer.Close();
        file.Close();

        Console.WriteLine("Information saved successfully.");
    }

    static void Pause()
    {
        Console.WriteLine("Press any key to continue");
        Console.ReadKey();
    }
}