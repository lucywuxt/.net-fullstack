using System;
public class Solution
{
    public string functionName(int x, string y)
    {
        // implement the funtion here
        return x + y;
    }
    static void Main(string[] args)
    {
        int integers = int.TryParse(Console.ReadLine());
        // OR
        int strings = Console.ReadLine();
        
        Solution s = new Solution();
        Console.WriteLine(s.functionName(integers, strings));
    }
}