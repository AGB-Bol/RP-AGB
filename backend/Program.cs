using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ConexiÃ³n a PostgreSQL (Debe ir antes de builder.Build())
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();



// CRUD de usuarios

// Obtener todos los usuarios
app.MapGet("/api/usuarios", async (ApplicationDbContext db) =>
{
    var usuarios = await db.Usuarios.ToListAsync();
    return Results.Ok(usuarios);
});

// Obtener un usuario por ID
app.MapGet("/api/usuarios/{id:guid}", async (Guid id, ApplicationDbContext db) =>
{
    var usuario = await db.Usuarios.FindAsync(id);

    return usuario is not null
        ? Results.Ok(usuario)
        : Results.NotFound(new { mensaje = "Usuario no encontrado" });
});

// Registrar un usuario
app.MapPost("/api/usuarios", async (UsuarioRequest request, ApplicationDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Nombre) ||
        string.IsNullOrWhiteSpace(request.Correo))
    {
        return Results.BadRequest(new
        {
            mensaje = "El nombre y el correo son obligatorios"
        });
    }

    var correoExiste = await db.Usuarios
        .AnyAsync(u => u.Correo == request.Correo);

    if (correoExiste)
    {
        return Results.Conflict(new
        {
            mensaje = "Ya existe un usuario con ese correo"
        });
    }

    var usuario = new Usuario
    {
        Id = Guid.NewGuid(),
        Nombre = request.Nombre.Trim(),
        Correo = request.Correo.Trim(),
        FechaCreacion = DateTime.UtcNow
    };

    db.Usuarios.Add(usuario);
    await db.SaveChangesAsync();

    return Results.Created($"/api/usuarios/{usuario.Id}", usuario);
});

// Actualizar un usuario
app.MapPut("/api/usuarios/{id:guid}", async (
    Guid id,
    UsuarioRequest request,
    ApplicationDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Nombre) ||
        string.IsNullOrWhiteSpace(request.Correo))
    {
        return Results.BadRequest(new
        {
            mensaje = "El nombre y el correo son obligatorios"
        });
    }

    var usuario = await db.Usuarios.FindAsync(id);

    if (usuario is null)
    {
        return Results.NotFound(new { mensaje = "Usuario no encontrado" });
    }

    var correoExiste = await db.Usuarios
        .AnyAsync(u => u.Correo == request.Correo && u.Id != id);

    if (correoExiste)
    {
        return Results.Conflict(new
        {
            mensaje = "Otro usuario ya utiliza ese correo"
        });
    }

    usuario.Nombre = request.Nombre.Trim();
    usuario.Correo = request.Correo.Trim();

    await db.SaveChangesAsync();

    return Results.Ok(usuario);
});

// Eliminar un usuario
app.MapDelete("/api/usuarios/{id:guid}", async (
    Guid id,
    ApplicationDbContext db) =>
{
    var usuario = await db.Usuarios.FindAsync(id);

    if (usuario is null)
    {
        return Results.NotFound(new { mensaje = "Usuario no encontrado" });
    }

    db.Usuarios.Remove(usuario);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();

// Modelo para recibir los datos del usuario
record UsuarioRequest(string Nombre, string Correo);

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
