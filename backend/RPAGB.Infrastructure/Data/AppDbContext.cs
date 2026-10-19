using Microsoft.EntityFrameworkCore;
using RPAGB.Domain.Entities;

namespace RPAGB.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Roles
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Id).HasColumnName("id");
            entity.Property(r => r.Name).HasColumnName("name").HasMaxLength(50).IsRequired();
            entity.Property(r => r.Description).HasColumnName("description").HasMaxLength(255);
            entity.Property(r => r.IsSystemRole).HasColumnName("is_system_role").HasDefaultValue(false);
            entity.Property(r => r.CreatedAt).HasColumnName("created_at");
            entity.Property(r => r.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(r => r.Name).IsUnique();
        });

        // 2. Permissions
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Id).HasColumnName("id");
            entity.Property(p => p.Code).HasColumnName("code").HasMaxLength(100).IsRequired();
            entity.Property(p => p.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(p => p.Module).HasColumnName("module").HasMaxLength(50).IsRequired();
            entity.Property(p => p.Description).HasColumnName("description").HasMaxLength(255);
            entity.Property(p => p.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(p => p.Code).IsUnique();
            entity.HasIndex(p => p.Module);
        });

        // 3. Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Id).HasColumnName("id");
            entity.Property(u => u.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
            entity.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            entity.Property(u => u.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
            entity.Property(u => u.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
            entity.Property(u => u.Phone).HasColumnName("phone").HasMaxLength(25);
            entity.Property(u => u.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(u => u.FailedLoginAttempts).HasColumnName("failed_login_attempts").HasDefaultValue(0);
            entity.Property(u => u.LockedUntil).HasColumnName("locked_until");
            entity.Property(u => u.LastLoginAt).HasColumnName("last_login_at");
            entity.Property(u => u.CreatedAt).HasColumnName("created_at");
            entity.Property(u => u.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.IsActive);
        });

        // 4. UserRoles
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");
            entity.HasKey(ur => new { ur.UserId, ur.RoleId });
            entity.Property(ur => ur.UserId).HasColumnName("user_id");
            entity.Property(ur => ur.RoleId).HasColumnName("role_id");
            entity.Property(ur => ur.AssignedAt).HasColumnName("assigned_at");

            entity.HasOne(ur => ur.User)
                  .WithMany(u => u.UserRoles)
                  .HasForeignKey(ur => ur.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Role)
                  .WithMany(r => r.UserRoles)
                  .HasForeignKey(ur => ur.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 5. RolePermissions
        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("role_permissions");
            entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });
            entity.Property(rp => rp.RoleId).HasColumnName("role_id");
            entity.Property(rp => rp.PermissionId).HasColumnName("permission_id");
            entity.Property(rp => rp.AssignedAt).HasColumnName("assigned_at");

            entity.HasOne(rp => rp.Role)
                  .WithMany(r => r.RolePermissions)
                  .HasForeignKey(rp => rp.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(rp => rp.Permission)
                  .WithMany(p => p.RolePermissions)
                  .HasForeignKey(rp => rp.PermissionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 6. RefreshTokens
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasKey(rt => rt.Id);
            entity.Property(rt => rt.Id).HasColumnName("id");
            entity.Property(rt => rt.UserId).HasColumnName("user_id");
            entity.Property(rt => rt.TokenHash).HasColumnName("token_hash").HasMaxLength(255).IsRequired();
            entity.Property(rt => rt.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
            entity.Property(rt => rt.UserAgent).HasColumnName("user_agent");
            entity.Property(rt => rt.IsRevoked).HasColumnName("is_revoked").HasDefaultValue(false);
            entity.Property(rt => rt.ExpiresAt).HasColumnName("expires_at");
            entity.Property(rt => rt.CreatedAt).HasColumnName("created_at");
            entity.Property(rt => rt.RevokedAt).HasColumnName("revoked_at");

            entity.HasIndex(rt => rt.TokenHash).IsUnique();

            entity.HasOne(rt => rt.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(rt => rt.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
