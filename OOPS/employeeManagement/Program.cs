using employeeManagement;

Employees emp1 = new Employees()
{
    empAge = 22,
    empName = "Kerry",
    empFavBoss = "Professor Nikhil Shah",
    doesEmpLikeJob = true,
    empRating = 4.5
};

Console.WriteLine("!~~~~~~~~~ Employee Management System ~~~~~~~~~!");
Console.WriteLine("Choose an option: \n1. View Employee Details \n2.Age Employee");
int choice = int.Parse(Console.ReadLine());

switch(choice)
{
    case 1:
        emp1.empDetails();
        break;

    case 2:
        Console.WriteLine("Enter the number of years to age the employee: ");
        int aging = int.Parse(Console.ReadLine());

        emp1.ageEmployee(aging);
        Console.WriteLine($"Employee aged successfully. New age: {emp1.empAge}");
        break;

    default:
        Console.WriteLine("Invalid choice.");
        break;
}