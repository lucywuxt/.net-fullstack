using System.Text.Json;
using System.Text.Json.Serialization;

namespace EmpManagement
{
    class Employee
    {
        [JsonRequired]
        public int empNo { get; set; }
        public string empName { get; set; } = "";
        public int empAvailableLeave { get; set; }

        [JsonPropertyName("MonthlyPay")]
        public double empSalary { get; set; }

        [JsonPropertyName("Permenant")]
        public bool empIsActive { get; set; }

        [JsonIgnore]
        public string empPassword { get; set; } // password should not be saved


        public int ApplyLeave(int days)
        {
            if (days > 5)
            {
                throw new Exception("Sorry cannot apply for more than 5 days");
            }
            empAvailableLeave = empAvailableLeave - days;
            return empAvailableLeave;
        }

        public double AppriseSalary()
        {
            empSalary = empSalary + 2000;
            return empSalary;
        }

        public string SaveObject()
        {
            var options = new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true,
                PropertyNameCaseInsensitive = true
            };

            // save this object
            string data = JsonSerializer.Serialize(this, options);
            File.WriteAllText(this.empNo + ".json", data);
            return "Object saved!";
        }

        public static Employee LoadObject()
        {
            string details = File.ReadAllText("101.json");
            Employee emp = JsonSerializer.Deserialize<Employee>(details);
            return emp;
        }
    }
}