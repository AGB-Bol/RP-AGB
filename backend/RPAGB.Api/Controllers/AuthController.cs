using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RPAGB.Application.DTOs.Auth;
using RPAGB.Infrastructure.Data;

namespace RPAGB.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, ILogger<AuthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Diagnóstico rápido de conexión con la base de datos PostgreSQL.
    /// </summary>
    [HttpGet("test-db")]
    public async Task<ActionResult<DbHealthCheckDto>> TestDatabaseConnection()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            if (!canConnect)
            {
                return StatusCode(500, new DbHealthCheckDto
                {
                    DatabaseConnected = false,
                    DatabaseName = _context.Database.GetDbConnection().Database
                });
            }

            var usersCount = await _context.Users.CountAsync();
            var rolesCount = await _context.Roles.CountAsync();
            var permissionsCount = await _context.Permissions.CountAsync();
            var roles = await _context.Roles.Select(r => r.Name).ToListAsync();

            return Ok(new DbHealthCheckDto
            {
                DatabaseConnected = true,
                DatabaseName = _context.Database.GetDbConnection().Database,
                UsersCount = usersCount,
                RolesCount = rolesCount,
                PermissionsCount = permissionsCount,
                SeededRoles = roles
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error conectando a la base de datos");
            return StatusCode(500, new
            {
                Message = "Error al intentar conectar con PostgreSQL",
                Details = ex.Message
            });
        }
    }

    /// <summary>
    /// Inicia sesión con email y contraseña, retornando datos de usuario, roles y permisos.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new LoginResponseDto
            {
                Success = false,
                Message = "El email y la contraseña son requeridos."
            });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "Credenciales incorrectas."
            });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "La cuenta se encuentra inactiva. Contacte al administrador."
            });
        }

        if (user.LockedUntil.HasValue && user.LockedUntil.Value > DateTime.UtcNow)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = $"Cuenta bloqueada por múltiples intentos fallidos hasta {user.LockedUntil.Value:HH:mm:ss} UTC."
            });
        }

        // Validación de contraseña con BCrypt
        bool passwordMatches = false;
        try
        {
            passwordMatches = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch (Exception)
        {
            passwordMatches = false;
        }

        if (!passwordMatches)
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockedUntil = DateTime.UtcNow.AddMinutes(15);
            }
            await _context.SaveChangesAsync();

            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "Credenciales incorrectas."
            });
        }

        // Login exitoso: reiniciar contador de fallos y actualizar último acceso
        user.FailedLoginAttempts = 0;
        user.LockedUntil = null;
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var userRoles = user.UserRoles
            .Select(ur => ur.Role.Name)
            .Distinct()
            .ToList();

        var userPermissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .OrderBy(p => p)
            .ToList();

        return Ok(new LoginResponseDto
        {
            Success = true,
            Message = "Autenticación exitosa.",
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,
                IsActive = user.IsActive,
                LastLoginAt = user.LastLoginAt
            },
            Roles = userRoles,
            Permissions = userPermissions
        });
    }

    /// <summary>
    /// Lista todos los roles y permisos del sistema.
    /// </summary>
    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.Description,
                r.IsSystemRole,
                Permissions = r.RolePermissions.Select(rp => new
                {
                    rp.Permission.Code,
                    rp.Permission.Name,
                    rp.Permission.Module
                })
            })
            .ToListAsync();

        return Ok(roles);
    }

    /// <summary>
    /// Lista todos los usuarios registrados y sus roles.
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Phone,
                u.IsActive,
                u.LastLoginAt,
                u.CreatedAt,
                Roles = u.UserRoles.Select(ur => ur.Role.Name)
            })
            .ToListAsync();

        return Ok(users);
    }
}
