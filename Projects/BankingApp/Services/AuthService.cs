using BankingApp.Data;
using BankingApp.Helpers;
using BankingApp.Models;
using Microsoft.EntityFrameworkCore;

namespace BankingApp.Services;

public class AuthService : IAuthService
{
    private readonly BankContext _db;

    public AuthService(BankContext db) => _db = db;

    public Customer? LoginCustomer(string username, string password)
    {
        var hash = PasswordHasher.Hash(password);
        return _db.Customers
            .Include(c => c.Account)
            .FirstOrDefault(c => c.Username == username && c.PasswordHash == hash);
    }

    public Admin? LoginAdmin(string username, string password)
    {
        var hash = PasswordHasher.Hash(password);
        return _db.Admins.FirstOrDefault(a => a.Username == username && a.PasswordHash == hash);
    }
}
