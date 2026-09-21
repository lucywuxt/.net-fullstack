using System.Text;

namespace BankingApp.Helpers;

public static class ConsoleHelper
{
    public static string ReadLine(string prompt)
    {
        Console.Write(prompt);
        return (Console.ReadLine() ?? string.Empty).Trim();
    }

    /// <summary>Reads a password and shows * for each character.</summary>
    public static string ReadPassword(string prompt)
    {
        Console.Write(prompt);
        var sb = new StringBuilder();

        while (true)
        {
            var key = Console.ReadKey(intercept: true);

            if (key.Key == ConsoleKey.Enter)
            {
                Console.WriteLine();
                break;
            }

            if (key.Key == ConsoleKey.Backspace)
            {
                if (sb.Length > 0)
                {
                    sb.Length--;
                    Console.Write("\b \b");
                }
                continue;
            }

            if (!char.IsControl(key.KeyChar))
            {
                sb.Append(key.KeyChar);
                Console.Write('*');
            }
        }

        return sb.ToString();
    }

    public static bool TryReadInt(string prompt, out int value)
        => int.TryParse(ReadLine(prompt), out value);

    public static bool TryReadDecimal(string prompt, out decimal value)
        => decimal.TryParse(ReadLine(prompt), out value);

    public static bool Confirm(string prompt)
        => ReadLine($"{prompt} (y/n): ").Equals("y", StringComparison.OrdinalIgnoreCase);

    public static void Header(string title)
    {
        Console.WriteLine();
        Console.WriteLine($"===== {title} =====");
    }
}
