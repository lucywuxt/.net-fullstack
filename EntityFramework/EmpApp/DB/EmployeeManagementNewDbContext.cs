using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace EmpApp.DB;

public partial class EmployeeManagementNewDbContext : DbContext
{
    public EmployeeManagementNewDbContext()
    {
    }

    public EmployeeManagementNewDbContext(DbContextOptions<EmployeeManagementNewDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Dept> Depts { get; set; }

    public virtual DbSet<Employee> Employees { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=localhost,1433;Initial Catalog=employeeManagementNewDB;User ID=sa;Password=LWxt-2004;Pooling=False;Encrypt=True;TrustServerCertificate=True;Authentication=SqlPassword;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Dept>(entity =>
        {
            entity.HasKey(e => e.DeptNo).HasName("PK__depts__BE2D3F557792A195");

            entity.ToTable("depts");

            entity.Property(e => e.DeptNo)
                .ValueGeneratedNever()
                .HasColumnName("deptNo");
            entity.Property(e => e.DeptLocation)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("deptLocation");
            entity.Property(e => e.DeptName)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("deptName");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.EmpNo).HasName("PK__employee__AFB335921AB288F2");

            entity.ToTable("employees");

            entity.Property(e => e.EmpNo)
                .ValueGeneratedNever()
                .HasColumnName("empNo");
            entity.Property(e => e.EmpDept).HasColumnName("empDept");
            entity.Property(e => e.EmpDesignation)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("empDesignation");
            entity.Property(e => e.EmpIsPermenant).HasColumnName("empIsPermenant");
            entity.Property(e => e.EmpName)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("empName");
            entity.Property(e => e.EmpSalary).HasColumnName("empSalary");

            entity.HasOne(d => d.EmpDeptNavigation).WithMany(p => p.Employees)
                .HasForeignKey(d => d.EmpDept)
                .HasConstraintName("fk_empDept");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
