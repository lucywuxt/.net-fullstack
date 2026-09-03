namespace Banking
{
    public class Savings : Accounts
    {
        public bool isODEnabled { get; set; }

        public override double Withdraw(double amount)
        {
            if (amount > 5000)
            {
                throw new Exception("withdrawal amount cannot be more than 5000");
            }
            else
            {
                return base.Withdraw(amount);
            }
        }

    }
}