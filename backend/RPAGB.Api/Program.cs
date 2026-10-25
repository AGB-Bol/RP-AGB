using RPAGB.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// 1. Inyección de dependencias de Infraestructura (PostgreSQL + AppDbContext)
builder.Services.AddInfrastructure(builder.Configuration);

// 2. Configuración de CORS para tus clientes React / Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", // Frontend Next.js local
                "http://localhost:5173"  // Vite / React local
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Habilitar Swagger en Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();