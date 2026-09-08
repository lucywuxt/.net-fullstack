namespace SavingsAccount
{
    public class Account
    {
        public int accNo { get; set; }
        public string accName { get; set; } = "";
        public double accBalance { get; set; }
        public bool accIsActive { get; set; }
        public string accBranch { get; set; } = "";

        public override string ToString()
        {
            return $"Account Number: {accNo}\n" +
                   $"Account Holder Name: {accName}\n" +
                   $"Balance: {accBalance}\n" +
                   $"Is active: {accIsActive}\n" +
                   $"Account open year: {accBranch}" +
                   "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
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

        public void Transfer(Account fromAcc, Account toAcc, double amount)
        {
            fromAcc.Withdraw(amount);
            toAcc.Deposit(amount);
        }
    }
}