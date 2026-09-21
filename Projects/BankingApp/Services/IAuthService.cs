using BankingApp.Models;

namespace BankingApp.Services;

public interface IAuthService
{
    Customer? LoginCustomer(string username, string password);
    Admin? LoginAdmin(string username, string password);
}
