using EmployeeManagement;

Employee emp1 = new Employee() { empNo = 101, empDepartmentNo = 20 };

List<Employee> eList = new List<Employee>()
{
    new Employee() {empNo=101, empName= "Tom", empDepartmentNo=10, empIsPermenant=true, empSalary=1000},
    new Employee() {empNo=102,empName="Jon Snow", empDepartmentNo=20, empIsPermenant=true, empSalary=2000},
    new Employee() {empNo = 103, empName = "Sunny Haynes", empDepartmentNo = 30, empIsPermenant = true, empSalary = 3000},new Employee() {empNo = 104, empName = "Peter Parker", empDepartmentNo = 20, empIsPermenant = true, empSalary = 4000},
    new Employee() {empNo = 105, empName = "Mary Jane", empDepartmentNo = 20, empIsPermenant = false, empSalary = 5000},
    new Employee() {empNo = 106, empName = "David Miller", empDepartmentNo = 20, empIsPermenant = true, empSalary = 6000},
    new Employee() {empNo = 107, empName = "Leo", empDepartmentNo = 40, empIsPermenant = true, empSalary = 7000},
    new Employee(){ empNo = 108, empName = "Paris", empDepartmentNo = 40, empIsPermenant = false, empSalary = 8000},
    new Employee() {empNo = 109, empName = "Shaggy", empDepartmentNo = 10, empIsPermenant = true, empSalary = 9000},
    new Employee() {empNo = 110, empName = "Enrique", empDepartmentNo = 10, empIsPermenant = true, empSalary = 10000 },
    new Employee() {empNo = 111, empName = "Micheal", empDepartmentNo = 20, empIsPermenant = false, empSalary = 1100 },
    new Employee() {empNo = 112, empName = "Shakira", empDepartmentNo = 20, empIsPermenant = true, empSalary = 12000 },
    new Employee() {empNo = 113, empName = "Drew Berry", empDepartmentNo = 40, empIsPermenant = true, empSalary = 13000 },
    new Employee() {empNo = 114, empName = "Monica", empDepartmentNo = 30, empIsPermenant = true, empSalary = 14000},
    new Employee() {empNo = 115, empName = "Chandler", empDepartmentNo = 20, empIsPermenant = false, empSalary = 15000},
    new Employee() {empNo = 116, empName = "Steffy", empDepartmentNo = 30, empIsPermenant = true, empSalary = 16000},
    new Employee() {empNo = 117, empName = "Tim", empDepartmentNo = 20, empIsPermenant = true, empSalary = 17000},
    new Employee() {empNo = 118, empName = "Charlie", empDepartmentNo = 40, empIsPermenant = true, empSalary = 18000},
    new Employee() {empNo = 119, empName = "Clara", empDepartmentNo = 40, empIsPermenant = false, empSalary = 19000},
    new Employee() {empNo = 120, empName = "Anthony", empDepartmentNo = 40, empIsPermenant = false, empSalary = 20000},
};

#region 1 select all the data

// var emp = from e in eList
//             //sort syntax
//             //filter syntax
//             //groupby syntax
//             //calcuations
//             //conditions
//             select e;

//     foreach (var item in emp)
//     {
//         Console.WriteLine(item.empName);
//     }

#endregion

#region 2 select employees with empNo > 115

// var emp = from e in eList
//           where e.empNo > 115
//           select e;

// foreach (var i in emp)
// {
//     Console.WriteLine($"{i.empNo} {i.empName}");
// }

#endregion

#region 3 select employees with Permenant position

// var emp = from e in eList
//           where e.empIsPermenant == true
//           select e;

// foreach (var i in emp)
// {
//     Console.WriteLine($"{i.empNo} {i.empName} {i.empIsPermenant}");
// }

#endregion

#region 4 select employee where empDepartmentNo = 20 and salary > 10000

// var emp = from e in eList
//     where e.empDepartmentNo == 20 && e.empSalary > 10000
//     select e;

// foreach(var i in emp)
// {
//     Console.WriteLine($"{i.empName} {i.empDepartmentNo} {i.empSalary}");
// }

#endregion

#region 5 select employee with string filters

// var emp = from e in eList
//           where e.empName.StartsWith("M") || e.empName.Contains("y") || e.empName.ToLower()[1] == 'a'
//           select e;

// foreach (var i in emp)
// {
//     Console.WriteLine($"{i.empName}");
// }

#endregion

#region 6 sort the data (default: ascending sort)

// var emp = from e in eList
//           orderby e.empName descending
//           select e;

// foreach (var i in emp)
// {
//     Console.WriteLine($"{i.empNo} {i.empName}");
// }

#endregion

#region 7 filter & sort

// var emp = from e in eList
//           where e.empDepartmentNo > 20
//           orderby e.empDepartmentNo
//           select e;

// foreach (var i in emp)
// {
//     Console.WriteLine($"{i.empDepartmentNo} {i.empName}");
// }

#endregion

#region 8 counting totals

// var totalPermenantEmp = (from e in eList
//                          where e.empIsPermenant == true
//                          select e).Count();

// var totalEmpInDept20 = (from e in eList
//                         where e.empDepartmentNo == 20
//                         select e).Count();

// Console.WriteLine($"Total Employees: {eList.Count()}");
// Console.WriteLine($"Total Permenant Employees: {totalPermenantEmp}");
// Console.WriteLine($"Total Employees in Dept 20: {totalEmpInDept20}");

#endregion

#region 9 min & max & avg & sum (aggregate functions)

// var minSalary = (from e in eList select e.empSalary).Min();
// var maxSalary = (from e in eList select e.empSalary).Max();
// var avgSalary = (from e in eList select e.empSalary).Average();
// var totalSalary = (from e in eList select e.empSalary).Sum();

// var avgNonPermenantSalary = (from e in eList
//                              where e.empIsPermenant == false
//                              select e.empSalary).Average();

// Console.WriteLine($"Min Salary: {minSalary} \nMax Salary: {maxSalary} \nAvg Salary: {avgSalary}");
// Console.WriteLine($"Avg Non-permenant Salary: {avgNonPermenantSalary}");
// Console.WriteLine($"Total Employment Cost: {totalSalary}");

#endregion

#region 10 caculations

// var calculated = from e in eList
//                  select new
//                  {
//                      Name = e.empName,
//                      MonthlySalary = e.empSalary.ToString("C"), //using the operating systems' Culture
//                      AnnualSalary = (e.empSalary * 12).ToString("C"),
//                      Bonus = e.empSalary * 0.2
//                  };
// foreach (var i in calculated)
// {
// Console.WriteLine($"Employee Name: {i.Name} \nMonthlySalary: {i.MonthlySalary} \nAnnualSalary: {i.AnnualSalary} \nBonus: {i.Bonus}");
// Console.WriteLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
// }

#endregion

#region 11 group by

// var empSummary = eList.GroupBy(e => e.empDepartmentNo);

// foreach (var dept in empSummary)
// {
//     Console.Write($"Dept {dept.Key}"); //print the unique department numbers
//     Console.WriteLine($" has {dept.Count()} employees");
//     foreach (var e in dept)
//     {
//      Console.WriteLine(e.empName);
//     }
//     Console.WriteLine("-----------------------");
// }

#endregion

#region 12 Lambda

// var totalSal = eList.Sum(e => e.empSalary);
// Console.WriteLine($"Total Salary: {totalSal}");

#endregion

