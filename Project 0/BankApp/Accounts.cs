namespace Accounts
{
    public class Account
    {
        public int accNo { get; set; }
        public string username { get; set; } = "";
        public string password { get; set; } = "";
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
    }
}