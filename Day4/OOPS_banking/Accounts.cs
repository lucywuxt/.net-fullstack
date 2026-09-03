namespace Banking
{

    public enum TypeOfAccount
    {
        Savings,
        Current,
        Loan
    }
    public class Accounts
    {
        #region Properties
        public int AccountNum { get; set; }
        public string AccountHolderName { get; set; } = "";
        public TypeOfAccount AccountType { get; set; }
        public double Balance { get; set; }
        public bool IsActive { get; set; }
        #endregion

        public double Withdraw(double amount)
        {
            if (amount > Balance)
            {
                throw new Exception("Insufficient Balance");
            }
            else if (amount < 0)
            {
                throw new Exception("Invalid Amount");
            }
            else
            {
                Balance -= amount;
                return Balance;
            }
        }
    }
}