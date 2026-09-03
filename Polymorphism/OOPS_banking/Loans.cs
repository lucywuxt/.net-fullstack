namespace Banking
{
    public class Loans : Accounts
    {
        public override double Withdraw(double amount)
        {
            throw new Exception("Withdrawals are not allowed for Loan accounts");
        }
    }
}