using System;
public class Solution
{
    static string functionName(int x, string y)
    {
        // implement the funtion here
        return x + y;
    }
    static void Main()
    {
        int integers = int.Parse(Console.ReadLine());
        // OR
        int strings = Console.ReadLine();

        Console.WriteLine(functionName(integers, strings));
    }
}