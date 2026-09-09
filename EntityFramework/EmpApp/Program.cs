using EmpApp.DB;

EmployeeManagementNewDbContext db = new EmployeeManagementNewDbContext();

#region select all departments
// var myDepts = from e in db.Depts
//             select e;

// foreach (var item in myDepts)
// {
//     Console.WriteLine($"{item.DeptNo} {item.DeptName}");
// }
#endregion

#region aggregation of depts
// var totalDept = (from e in db.Depts
//                 select e.DeptNo).Count();

//                 Console.WriteLine("Total Departments : " + 4);
#endregion

#region select with order by - sort operation
// var allEmps = from e in db.Employees
//               orderby e.EmpDesignation
//               select e;

// Console.WriteLine($"Emp No      Name      Designation");
// foreach (var item in allEmps)
// {
//     Console.WriteLine($"{item.EmpNo}           {item.EmpName}       {item.EmpDesignation}");
// }
#endregion

#region search an employee
// Console.WriteLine("Enter EmpNo to view details :");
// int eno =Convert.ToInt32( Console.ReadLine());

// var edetails = (from e in db.Employees
//                 where e.EmpNo == eno
//                 select e).Single();

// Console.WriteLine($"Name: {edetails.EmpName}");

// Console.WriteLine($"Designation: {edetails.EmpDesignation}");

// Console.WriteLine($"Salary: {edetails.EmpSalary}");

// Console.WriteLine($"Is permenant: {edetails.EmpIsPermenant}");
#endregion

#region  add a new Employee
// 1. create a new employee
// Employee newEmp = new Employee()
// {
//     EmpNo = 13,
//     EmpName = "Allan",
//     EmpDept = 20,
//     EmpDesignation = "Jr.Accountant",
//     EmpIsPermenant = true,
//     EmpSalary = 3500
// };

// db.Employees.Add(newEmp); // 2. add to app memory (RAM)

// db.SaveChanges(); // 3. push the changes in memory to the database

// Console.WriteLine("New Employee Added Successfully");
#endregion

#region delete an employee
// Console.WriteLine("Enter EmpNo to be deleted:");
// int emp_To_delete = Convert.ToInt32(Console.ReadLine());

// // no need to read or select the emp, just point to that employee
// var emp = db.Employees.FirstOrDefault(e => e.EmpNo == emp_To_delete); 

// if(emp != null)
// {
// db.Employees.Remove(emp);
// Console.WriteLine("Employee Deleted");
// }
// else
// {
//     Console.WriteLine("Employee with No " + emp_To_delete + " Not found in system");
// }

// db.SaveChanges(); // push changes to database
#endregion

#region - update an employee
// update a single employee
// var emp = db.Employees.FirstOrDefault(e => e.EmpNo == 10);

// emp.EmpName = "Prof." + emp.EmpName;
// emp.EmpSalary += 300;

// db.SaveChanges();
// Console.WriteLine("Employee No 10 details have updated");

// // update salary for every employee
// var allemp = from e in db.Employees
//              select e;

//         foreach (var item in allemp)
//         {
//             item.EmpSalary += 250;
//         }

// db.SaveChanges();
// Console.WriteLine("Salary of all the emplpyees are updated");
#endregion