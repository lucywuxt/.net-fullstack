using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ShoppingDBAPI.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Product> Products { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.PId).HasName("PK_NewTable");

            entity.Property(e => e.PId)
                .ValueGeneratedNever()
                .HasColumnName("pId");
            entity.Property(e => e.PCategory)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("pCategory");
            entity.Property(e => e.PIsInStock).HasColumnName("pIsInStock");
            entity.Property(e => e.PName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("pName");
            entity.Property(e => e.PPrice)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("pPrice");
            entity.Property(e => e.PQty).HasColumnName("pQty");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
