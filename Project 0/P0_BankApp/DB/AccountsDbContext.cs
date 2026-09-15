using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace BankApp.DB;

public partial class AccountsDbContext : DbContext
{
    public AccountsDbContext()
    {
    }

    public AccountsDbContext(DbContextOptions<AccountsDbContext> options)
        : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=localhost,1434;Initial Catalog=accountsDB;User ID=SA;Password=LWxt1234;Pooling=False;TrustServerCertificate=True;Authentication=SqlPassword");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
