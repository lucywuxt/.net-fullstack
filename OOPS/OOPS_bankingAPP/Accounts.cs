namespace OOPS_bankingAPP
{
    public class Accounts
    {
        #region Getter & Setter Notes

        // int AccNum; // should not disclose this
        // public int AccNum
        // {
        //     get { return AccNum; }
        //     set { AccNum = value; }
        // }

        // variable will lbe created and used by runtime
        // so we don't need to create a variable for this property
        // public int AccNum { get; set; } // auto implemented property

        #endregion

        #region Properties
        public int AccNum { get; set; }
        public string AccName { get; set; }
        public double AccBalance { get; set; }
        public bool IsActive { get; set; } = true; // default value
        public string Email { get; set; } // default value is null

        #endregion

        #region Methods

        public double Withdraw(double amount)
        {
            if (amount > 0 && amount <= AccBalance)
            {
                AccBalance -= amount;
                return AccBalance;
            }
            else
            {
                throw new Exception("Invalid withdraw amount");
            }
        }

        public double Deposit(double amount)
        {
            if (amount < 0)
            {
                throw new Exception("Invalid deposit amount");
            }
            else
            {
                AccBalance += amount;
                return AccBalance;
            }
        }
        #endregion
    }

}