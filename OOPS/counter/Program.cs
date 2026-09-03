using System.IO;
Console.WriteLine("Counter Demo");


// if (File.Exists("counter.txt"))
// {
//     int counter = int.Parse(File.ReadLines("counter.txt").LastOrDefault() ?? "0");

//     Console.WriteLine($"You have run this program {counter + 1} times.");

//     myPen = new StreamWriter("counter.txt");
//     myPen.WriteLine(counter + 1);
//     myPen.Close();
// }
// else
// {
//     counterFile = new FileStream("counter.txt", FileMode.Create, FileAccess.Write);

//     Console.WriteLine($"You have run this program 1 time.");

//     myPen = new StreamWriter("counter.txt");
//     myPen.WriteLine("1");
//     myPen.Close();
// }

FileStream counterFile = new FileStream("counter.txt", FileMode.OpenOrCreate, FileAccess.Write);
int counter = int.Parse(File.ReadLines("counter.txt").LastOrDefault() ?? "0");
Console.WriteLine($"You have run this program {counter + 1} times.");
StreamWriter myPen = new StreamWriter("counter.txt");
myPen.WriteLine(counter + 1);
myPen.Close();
