using System.Reflection;
using System.Runtime.CompilerServices;

var myApp = Assembly.LoadFile("/Users/lucywu/Desktop/Code Stuff/Revature/.net-fullstack/Memory Graph, CLR, GC, Serialization, Reflection/bankLIB/bin/Debug/net10.0/bankLIB.dll");

// give the list of all the classes in that dll
Type[] myClasses = myApp.GetTypes();

foreach (var i in myClasses)
{
    Console.WriteLine(i.FullName);
}

MethodInfo[] myMethods = myClasses[1].GetMethods();
foreach (var i in myMethods)
{
    Console.WriteLine(i);
}

var myClass = myClasses[3];
// create a new object of myMaths
var obj = Activator.CreateInstance(myClass);
MethodInfo m = myClass.GetMethod("Add");
Object[] parameters = new object[]{10,20};
Object result = (int)m.Invoke(obj,parameters);
Console.WriteLine(result);