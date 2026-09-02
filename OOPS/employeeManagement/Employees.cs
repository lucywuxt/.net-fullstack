namespace employeeManagement
{
    public class Employees
    {
        #region Properties
        public int empAge { get; set; }
        public string empName { get; set; }
        public string empFavBoss {get; set; }
        public bool doesEmpLikeJob { get; set; }
        public double empRating { get; set; }
        
        #endregion

        #region Methods
        public void empDetails()
        {
            Console.WriteLine($"Employee Name: {empName}");
            Console.WriteLine($"Employee Age: {empAge}");
            Console.WriteLine($"Employee Favorite Boss: {empFavBoss}");
            Console.WriteLine($"Does Employee Like Job: {doesEmpLikeJob}");
            Console.WriteLine($"Employee Rating: {empRating}");
        }

        public int ageEmployee(int aging)
        {
            return empAge += aging;
        }

        #endregion
    }
}