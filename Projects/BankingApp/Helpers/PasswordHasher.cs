using System.Security.Cryptography;
using System.Text;

namespace BankingApp.Helpers;

// NOTE: SHA-256 keeps this demo simple. For production use a salted, slow hash (BCrypt / PBKDF2 / Argon2).
public static class PasswordHasher
{
    public static string Hash(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }
}
