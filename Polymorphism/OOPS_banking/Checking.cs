namespace Banking
{
    public class Checking : Accounts
    {
        public bool isODEnabled { get; set; }

        public override double Withdraw(double amount)
        {
            if (amount > 30000)
            {
                throw new Exception("withdrawal amount cannot be more than 30000");
            }
            return base.Withdraw(amount);
        }
    }
}