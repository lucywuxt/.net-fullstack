using System.Reflection;

var myApp = Assembly.LoadFile(@"/Users/lucywu/Desktop/Code Stuff/Revature/.net-fullstack/Memory Graph, CLR, GC/bankLIB");

// give the list of all the classes
Type[] myClasses = myApp.GetTypes();

foreach (var i in myClasses)
{
    Console.WriteLine(i.FullName);
}

MethodInfo[] myMethods = myClasses.GetMethods();
foreach (var m in myMethods)
{
    Console.WriteLine(m);
}

var myClass = myClasses[3];
// create a new object of myMethod
var obj = Activator.CreateInstance(myClass);
MethodInfo m = myClass.GetMethod("Add");
Object[] parameters = new object[]{10,20};
Object result = (int)m.Invoke(obj,parameters);
Console.WriteLine(result);