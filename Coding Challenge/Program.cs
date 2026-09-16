using System;
using System.Collections;
using System.Linq;
using System.Text.RegularExpressions;
public class Solution
{
    static int longest(string input)
    {
        if (string.IsNullOrEmpty(input))
        {
            return 0;
        }
        return input
            .Split(" ", StringSplitOptions.RemoveEmptyEntries)
            .Select(w => Regex.Replace(w, @"[\p{P}\p{S}]", "").Length)
            .DefaultIfEmpty(0)
            .Max();
    }

    static string RemoveAllOccurrences(string paragraph, string substring)
    {
        if (string.IsNullOrEmpty(substring))
            return paragraph;

        return paragraph.Replace(substring, "");
    }
    static void Main()
    {
        Console.WriteLine("longest word input:");
        string input = Console.ReadLine();
        Console.WriteLine(longest(input));

        string s1 = Console.ReadLine();
        string s2 = Console.ReadLine();
        Console.WriteLine(RemoveAllOccurrences(s1, s2));
    }
}