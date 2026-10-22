using Loanly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loanly.Api.Data;

public class LoanlyDbContext : DbContext
{
    public LoanlyDbContext(DbContextOptions<LoanlyDbContext> options) : base(options)
    {
    }

    public DbSet<Country> Countries => Set<Country>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<WithdrawalApplication> WithdrawalApplications => Set<WithdrawalApplication>();
    public DbSet<Disbursement> Disbursements => Set<Disbursement>();
    public DbSet<ResultsIndicator> ResultsIndicators => Set<ResultsIndicator>();
    public DbSet<SupportingDocument> SupportingDocuments => Set<SupportingDocument>();
    public DbSet<AuditLogEntry> AuditLogEntries => Set<AuditLogEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Country>(entity =>
        {
            entity.HasIndex(c => c.ContactEmail).IsUnique();
            entity.HasIndex(c => c.IsoAlpha3).IsUnique();
        });

        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasIndex(a => a.Email).IsUnique();
            entity.Property(a => a.Role).HasConversion<string>().HasMaxLength(40);
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasIndex(p => p.ProjectCode).IsUnique();
            entity.Property(p => p.ApprovedAmount).HasPrecision(18, 2);
            entity.Property(p => p.Sector).HasConversion<string>().HasMaxLength(40);
            entity.Property(p => p.FinancingInstrument).HasConversion<string>().HasMaxLength(40);
            entity.Property(p => p.Status).HasConversion<string>().HasMaxLength(40);

            entity.HasOne(p => p.Country)
                .WithMany(c => c.Projects)
                .HasForeignKey(p => p.CountryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WithdrawalApplication>(entity =>
        {
            entity.HasIndex(w => w.ApplicationNumber).IsUnique();
            entity.Property(w => w.AmountRequested).HasPrecision(18, 2);
            entity.Property(w => w.Category).HasConversion<string>().HasMaxLength(40);
            entity.Property(w => w.Status).HasConversion<string>().HasMaxLength(40);

            entity.HasOne(w => w.Project)
                .WithMany(p => p.WithdrawalApplications)
                .HasForeignKey(w => w.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(w => w.ReviewedByAdmin)
                .WithMany(a => a.ReviewedApplications)
                .HasForeignKey(w => w.ReviewedByAdminId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Disbursement>(entity =>
        {
            entity.HasIndex(d => d.WithdrawalApplicationId).IsUnique();
            entity.Property(d => d.AmountDisbursed).HasPrecision(18, 2);
            entity.Property(d => d.DesignatedAccountBalanceAfter).HasPrecision(18, 2);

            entity.HasOne(d => d.WithdrawalApplication)
                .WithOne(w => w.Disbursement)
                .HasForeignKey<Disbursement>(d => d.WithdrawalApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ResultsIndicator>(entity =>
        {
            entity.Property(r => r.BaselineValue).HasPrecision(18, 2);
            entity.Property(r => r.TargetValue).HasPrecision(18, 2);
            entity.Property(r => r.CurrentValue).HasPrecision(18, 2);

            entity.HasOne(r => r.Project)
                .WithMany(p => p.ResultsIndicators)
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SupportingDocument>(entity =>
        {
            entity.Property(d => d.DocumentType).HasConversion<string>().HasMaxLength(40);

            entity.HasOne(d => d.WithdrawalApplication)
                .WithMany(w => w.SupportingDocuments)
                .HasForeignKey(d => d.WithdrawalApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLogEntry>(entity =>
        {
            entity.HasIndex(a => new { a.EntityType, a.EntityId });
            entity.HasIndex(a => new { a.CountryId, a.CreatedAt });
        });
    }
}
