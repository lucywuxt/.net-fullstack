using System.Collections;
using EmployeeManagement;

Console.BackgroundColor = ConsoleColor.Cyan;

#region Array

// int[] nums = new int[10];
// for(int i = 0; i < nums.Length; i++)
// {
//     Console.WriteLine($"Please enter your {i} number");
//     int.TryParse(Console.ReadLine(), out int number);
//     nums[i] = number;
// }

// int sum = 0;
// int evenNum = 0;
// int oddNum = 0;

// foreach(int i in nums){
//     sum += i;
    
//     if(i % 2 == 0)
//     {
//         evenNum++;
//     }
//     else
//     {
//         oddNum++;
//     }
// }
// Console.WriteLine($"The sum of all numbers: {sum}");
// Console.WriteLine($"Number of even numbers: {evenNum}");
// Console.WriteLine($"Number of odd numbers: {oddNum}");

#endregion

#region ArrayList

// ArrayList l = new ArrayList();
// l.Add(10);
// l.Add("bruh");
// l.Add(false);
// l.Add(new DateTime());
// l.Add(new {empNo = 101, empName = "bruhhh", empDept = "IT"});

// foreach (var item in l)
// {
//     Console.WriteLine(item);
// }
// Console.WriteLine(l.Count);

#endregion

#region List

// List<Employee> empList = new List<Employee>();
// empList.Add(new Employee(){empNo=101, empName="Lucy", empDept=10, empIsPermenant=true, empSalary=5000});
// empList.Add(new Employee(){empNo=102, empName="Wucy", empDept=01, empIsPermenant=true, empSalary=10000});
// empList.Add(new Employee(){empNo=103, empName="Pucy", empDept=11, empIsPermenant=false, empSalary=5});

// foreach (var e in empList)
// {
//     Console.WriteLine($"Emp No: {e.empNo}");
//     Console.WriteLine($"Emp Name: {e.empName}");
//     Console.WriteLine($"Emp Dept: {e.empDept}");
//     Console.WriteLine($"Emp Salary: {e.empSalary}");
//     Console.WriteLine($"Emp is permenant: {e.empIsPermenant}");
//     Console.WriteLine("-----------------------------------");
// }

#endregion

#region Hashtable

// Hashtable friends = new Hashtable();
// friends.Add(1,"Hi");
// friends.Add(2,"You");
// friends.Add(3,"Don't");
// friends.Add(4,"Have");
// friends.Add(5,"Friends");
// friends.Add(":(", true);

// foreach(var f in friends.Values)
// {
//     Console.WriteLine(f);
// }

#endregion

#region Dictionary

// Dictionary<int, string> friends = new Dictionary<int, string>();
// friends.Add(1,"a");
// friends.Add(2,"b");
// friends.Add(3,"c");
// friends.Add(4,"a");

// foreach(var f in friends.Values)
// {
//     Console.WriteLine(f);
// }

#endregion