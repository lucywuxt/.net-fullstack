using System.IO.Compression;
using EmpManagement;

// Employee empObj = new Employee()
// {
//     empNo = 101,
//     empName = "Mike",
//     empAvailableLeave = 30,
//     empSalary = 20000,
//     empIsActive = true,
//     empPassword = "IncorrectPassword"
// };

Employee empObj = Employee.LoadObject();


bool continueWork = true;
while (continueWork)
{
    Console.WriteLine("Employee Details");
    Console.WriteLine($"Emp No: {empObj.empNo}");
    Console.WriteLine($"Name: {empObj.empName}");
    Console.WriteLine($"Leaves: {empObj.empAvailableLeave}");
    Console.WriteLine($"Salary: {empObj.empSalary}");
    Console.WriteLine($"Is active: {empObj.empIsActive}");

    Console.WriteLine("---------------------------------");
    
    Console.WriteLine("Select from the option");
    Console.WriteLine("1. Apply Leave");
    Console.WriteLine("2. Apprise Salary");
    Console.WriteLine("3. Edit First Name");
    Console.WriteLine("4. Exit");

    int choice;
    choice = Convert.ToInt32(Console.ReadLine());
    switch (choice)
    {
        case 1:
            Console.WriteLine("Enter number of days for leaves: ");
            int leaves = Convert.ToInt32(Console.ReadLine());
            empObj.ApplyLeave(leaves);
            Console.WriteLine("Leaves approved!");
            break;
        case 2:
            empObj.AppriseSalary();
            Console.WriteLine("Congrats!");
            break;
        case 3:
            Console.WriteLine("Enter new name: ");
            string newName = Console.ReadLine();
            empObj.empName = newName;
            Console.WriteLine("Name is updated!");
            break;
        case 4:
            continueWork = false;
            Console.WriteLine("Thank you for using the app!");
            empObj.SaveObject();
            break;
        default:
            Console.WriteLine("Invalid option!");
            break;
    }
}