namespace Banking
{
    public enum TypeOfAccount
    {
        Savings,
        Checking,
        Loans
    }
    public abstract class Accounts
    {

        public static int AccCounter = 1;

        #region Properties
        public int AccountNum { get; set; }
        public string AccountHolderName { get; set; } = "";
        public TypeOfAccount AccountType { get; set; }
        public double Balance { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public int AccountOpenYear { get; set; } = 2026;
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

        public double CheckBalance()
        {
            return Balance;
        }

        public double InterestCalculator(double interest)
        {
            return Balance += Balance * interest;
        }

        public override string ToString()
        {
            return $"Account Number: {AccountNum}\n" +
                   $"Account Holder Name: {AccountHolderName}\n" +
                   $"Account Type: {AccountType}\n" +
                   $"Balance: {Balance}\n" +
                   $"Is active: {IsActive}\n" +
                   $"Account open year: {AccountOpenYear}";
        }
        #endregion
    }
}