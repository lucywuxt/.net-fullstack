#region data types

string name = "Lucy";
string designation = "Software Engineer";
int age = 22;
double salary = 20000.50;
bool isMarried = false;

#endregion

#region input (also does conditional checking)

Console.WriteLine("!~~~~~~~~~~~~ Welcome to CITI Bank ~~~~~~~~~~~~~!");
Console.WriteLine("Please enter your name: ");
string userName = Console.ReadLine();

Console.WriteLine("Please enter your city: ");
string userCity = Console.ReadLine();

Console.WriteLine("Please enter your age: ");
int userAge = Convert.ToInt32(Console.ReadLine());

Console.WriteLine("Please enter your marital status (true/false): ");
bool userMarried = Convert.ToBoolean(Console.ReadLine());

Console.WriteLine("Thank you for providing your information. We will process it shortly.");


#region Condition checking

bool validationPassed = true;

// 1. name should not be empty or null 
// & should not contain less than 3 and more than 25 chars
// & need to convert the name to uppercase
if (string.IsNullOrEmpty(userName) || userName.Length < 3 || userName.Length > 25)
{
    validationPassed = false;
    Console.WriteLine("Invalid name. Please enter a name with 3 to 25 characters.");
}else{
    userName = userName.ToUpper();
}

// 2. city should not be empty or null & can only be: "New York", "Los Angeles", "Chicago"
if (string.IsNullOrEmpty(userCity) || (userCity != "New York" && userCity != "Los Angeles" && userCity != "Chicago"))
{
    validationPassed = false;
    Console.WriteLine("Invalid city. Please enter either 'New York', 'Los Angeles', or 'Chicago'.");
}

// 3. age should be between 18 and 60 & cannot be negative or zero & cannot be a decimal number & not empty or null
if (string.IsNullOrEmpty(userAge.ToString()) || userAge < 18 || userAge > 60)
{
    validationPassed = false;
    Console.WriteLine("Invalid age. Please enter an age between 18 and 60.");
}else if (userAge <= 0)
{
    validationPassed = false;
    Console.WriteLine("Invalid age. Age cannot be negative or zero.");
}else if (userAge % 1 != 0)
{
    validationPassed = false;
    Console.WriteLine("Invalid age. Age cannot be a decimal number.");
}

if(isMarried != true && isMarried != false)
{
    validationPassed = false;
    Console.WriteLine("Invalid marital status. Please enter either 'true' or 'false'.");
}

if (validationPassed)
{
    Console.WriteLine($"Approved! Thank you {userName} from {userCity}, age {userAge}, marital status: {userMarried}. Your information has been successfully processed.");
}
else
{
    Console.WriteLine("Some inputs are invalid. Please review the error messages above.");
}

#endregion

#endregion