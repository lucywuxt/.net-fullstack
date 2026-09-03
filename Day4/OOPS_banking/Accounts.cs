namespace Banking
{
    public enum TypeOfAccount
    {
        Savings,
        Current,
        Loan
    }
    public abstract class Accounts
    {
        #region Properties
        public int AccountNum { get; set; }
        public string AccountHolderName { get; set; } = "";
        public TypeOfAccount AccountType { get; set; }
        public double Balance { get; set; }
        public bool IsActive { get; set; }
        #endregion
        
        #region Methods
        public virtual double Withdraw(double amount)
        {
            if (amount < 100)
            {
                throw new Exception("withdrawal amount should be more than 100");
            }
            else
            {
                return Balance -= amount;
            }
        }

        public double Deposit(double amount)
        {
            if (amount < 0)
            {
                throw new Exception("Invalid amount");
            }
            else
            {
                Balance += amount;
                return Balance;
            }
        }

        public double AvailableBalance()
        {
            return Balance;
        }
        #endregion
    }
}