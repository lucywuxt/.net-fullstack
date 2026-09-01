
#region guess the secret number

int secretNumber = 7;
Console.WriteLine("Guess the secret number, you have 3 attempts.");
for (int i = 0; i < 3; i++)
{
    Console.Write("Enter your guess: ");
    int userGuess;
    if (int.TryParse(Console.ReadLine(), out userGuess))
    {
        if (userGuess == secretNumber)
        {
            Console.WriteLine("Congratulations! You've guessed the secret number.");
            break;
        }
        else
        {
            Console.WriteLine("Incorrect guess. Try again.");
        }
    }
    else
    {
        Console.WriteLine("Please enter a valid number.");
    }
}

#endregion

int userInput = 0;
int addition = 0;
int evenNum = 0;
int oddNum = 0;
int totalNum = 0;
int graterThan100 = 0;

do
{
    Console.Write("Enter a number (or enter '0' to exit): ");
    string input = Console.ReadLine();

    if (int.TryParse(input, out userInput))
    {
        addition += userInput;
        totalNum++;

        if (userInput % 2 == 0)
        {
            evenNum++;
        }
        else
        {
            oddNum++;
        }

        if (userInput > 100)
        {
            graterThan100++;
        }
    }
    else
    {
        Console.WriteLine("Please enter a valid number.");
    }
} while (userInput != 0);

Console.WriteLine($"Total numbers entered: {totalNum-1}"); // Subtracting 1 to exclude the exit input (0)
Console.WriteLine($"Sum of all numbers: {addition}");
Console.WriteLine($"Count of even numbers: {evenNum-1}"); // Subtracting 1 to exclude the exit input (0)
Console.WriteLine($"Count of odd numbers: {oddNum}");
Console.WriteLine($"Count of numbers greater than 100: {graterThan100}");