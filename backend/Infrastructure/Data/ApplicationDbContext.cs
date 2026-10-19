using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
   public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : base(options)
{
}

    // Aquí le decimos a EF Core que queremos una tabla llamada "Usuarios"
    public DbSet<Usuario> Usuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Opcional: Aquí puedes configurar reglas específicas para la tabla,
        // como hacer que el Correo sea único, campos obligatorios, etc.
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Correo)
            .IsUnique();
    }
}