using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using RPAGB.Infrastructure;
using RPAGB.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Inyección de dependencias de Infraestructura (PostgreSQL + AppDbContext)
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddScoped<JwtTokenService>();

// Configuración de autenticación JWT
var jwtKey = Convert.FromBase64String(
    builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key no configurada.")
);

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtKey),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("USERS_CREATE", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "USERS_CREATE"));

    options.AddPolicy("USERS_READ", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "USERS_READ"));

    options.AddPolicy("USERS_UPDATE", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "USERS_UPDATE"));

    options.AddPolicy("USERS_DELETE", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "USERS_DELETE"));

    options.AddPolicy("ROLES_MANAGE", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "ROLES_MANAGE"));

    options.AddPolicy("ROLES_ASSIGN", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "ROLES_ASSIGN"));

    options.AddPolicy("SESSIONS_READ", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "SESSIONS_READ"));

    options.AddPolicy("SESSIONS_REVOKE", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "SESSIONS_REVOKE"));
});

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