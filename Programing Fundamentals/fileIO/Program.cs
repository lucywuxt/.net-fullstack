using System.IO;
Console.WriteLine("File IO Demo");

#region Create & Write to a file

// this is a book
FileStream myFile = new FileStream("myFile.txt", FileMode.Create, FileAccess.ReadWrite);

// this is my pen
StreamWriter myPen = new StreamWriter(myFile);

// let's write!
myPen.WriteLine("Hello, my name is Lucy this is my book");
myPen.WriteLine("I am a master student at UIUC");
Console.WriteLine("Enter your favorite drink?");
String myDrink = Console.ReadLine();
myPen.WriteLine("My favorite drink is " + myDrink);

// let's put the pen away & close the book
// if you don't close the pen, the data will not be written to the file & the memory will not be released
myPen.Close(); 
myFile.Close();

Console.WriteLine("File writing completed.");

#endregion

#region Read from a file

FileStream myBook = new FileStream("myFile.txt", FileMode.Open, FileAccess.Read);

StreamReader myReader = new StreamReader(myBook);

Console.WriteLine(myReader.ReadToEnd());

myReader.Close();

#endregion