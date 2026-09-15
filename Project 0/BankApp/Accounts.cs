using System.Text.Json;
using System.Text.Json.Serialization;

namespace Accounts
{
    public class Account
    {
        [JsonRequired]
        public int accNo { get; set; }
        public string username { get; set; } = "";

        // [JsonIgnore]
        public string password { get; set; }

        [JsonPropertyName("Balance")]
        public double accBalance { get; set; }

        public override string ToString()
        {
            return $"Account Number: {accNo}\n" +
                   $"Account Holder Name: {username}\n" +
                   $"Balance: {accBalance}\n" +
                   "------------------------------------";
        }

        public double Withdraw(double amount)
        {
            if (amount < 0 || amount > accBalance)
            {
                throw new Exception("Invalid withdrawal amount.");
            }

            return accBalance -= amount;
        }

        public double Deposit(double amount)
        {
            if (amount < 0)
            {
                throw new Exception("Invalid deposit amount.");
            }

            return accBalance += amount;
        }

        public static void Transfer(Account fromAcc, Account toAcc, double amount)
        {
            fromAcc.Withdraw(amount);
            toAcc.Deposit(amount);
        }

         public void SaveObject()
        {
            // set up the Json format
            var format = new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true,
                PropertyNameCaseInsensitive = true
            };

            // save this object
            string data = JsonSerializer.Serialize(this, format);
            File.WriteAllText(this.username + this.password + ".json", data);
        }

        public static Account LoadObject(string username, string password)
        {
            string details = File.ReadAllText($"{username}{password}.json");
            Account acc = JsonSerializer.Deserialize<Account>(details);
            return acc;
        }
    }
}