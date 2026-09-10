using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace EmpManagement
{
    class Employee
    {
        [JsonRequired]
        public int empNo { get; set; }
        public string empName { get; set; }
        public int empAvailableLeave { get; set; }
        public double empSalary { get; set; }
        public bool empIsActive { get; set; }

        [JsonIgnore]
        public string empPassword { get; set; }


        public void ApplyLeave(int leaves)
        {
            empAvailableLeave += leaves;
        }

        public void AppriseSalary()
        {
            // empAvailableLeave += leaves;
        }

        public string SaveObject()
        {
            var options = new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true,
                PropertyNamingCaseInsensitive = true
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