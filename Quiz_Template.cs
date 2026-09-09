// using System;
// public class Solution
// {
//     public string functionName(int x, string y)
//     {
//         // implement the funtion here
//         return x + y;
//     }
//     static void Main(string[] args)
//     {
//         int integers = int.TryParse(Console.ReadLine());
//         // OR
//         int strings = Console.ReadLine();

//         Solution s = new Solution();
//         Console.WriteLine(s.functionName(integers, strings));
//     }
// }


// ----------------- Wiget -----------------
using System;
public class Solution
{
    public long Widgets(int x)
    {
        long sum = 0;
        for(int i = 1; i <= x; i++)
        {
            sum += (long)i*i;
        }
        return sum;
    }
    static void Main(string[] args)
    {
        int x = int.Parse(Console.ReadLine());

        Solution s = new Solution();
        Console.WriteLine(s.Widgets(x));
    }
}


// -------------------- Palindrome --------------------
// using System;
// using System.Text.RegularExpressions;
// public class Solution
// {
//     public string Palindrome(string x)
//     {
//         string clean = Regex.Replace(x, @"[^\w]", "").ToLower();

//         for(int i = 0; i < clean.Length/2; i++)
//         {
//             if(clean[i] != clean[clean.Length - 1 - i])
//             {
//                 return "NO";
//             }
//         }
//         return "YES";
//     }
//     static void Main(string[] args)
//     {
//         string x = Console.ReadLine();

//         Solution s = new Solution();
//         Console.WriteLine(s.Palidrome(x));
//     }
// }