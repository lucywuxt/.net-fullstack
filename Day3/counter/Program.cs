using System.IO;
Console.WriteLine("Counter Demo");

int counter = int.Parse(File.ReadLines("counter.txt").LastOrDefault() ?? "0");

Console.WriteLine($"You have run this program {counter + 1} times.");

StreamWriter myPen = new StreamWriter("counter.txt");
myPen.WriteLine(counter + 1);
myPen.Close();
