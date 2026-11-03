using RPAGB.Api.Services;
using RPAGB.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RPAGB.Application.DTOs.Auth;
using RPAGB.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace RPAGB.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AuthController> _logger;

    private readonly JwtTokenService _jwtTokenService;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
    AppDbContext context,
    ILogger<AuthController> logger,
    JwtTokenService jwtTokenService,
    IWebHostEnvironment environment)
    {
        _context = context;
        _logger = logger;
        _jwtTokenService = jwtTokenService;
        _environment = environment;
    }
    /// <summary>
    /// Diagnóstico rápido de conexión con la base de datos PostgreSQL.
    /// </summary>
    [HttpGet("test-db")]
    public async Task<ActionResult<DbHealthCheckDto>> TestDatabaseConnection()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }
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


        // Generar Access Token
        var accessToken = _jwtTokenService.GenerateAccessToken(
            user,
            userRoles,
            userPermissions
        );

        // Generar Refresh Token
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);

        // Guardar únicamente el hash del Refresh Token
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwtTokenService.HashRefreshToken(refreshToken),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            ExpiresAt = refreshTokenExpiresAt
        };

        _context.RefreshTokens.Add(refreshTokenEntity);

        await _context.SaveChangesAsync();

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
            Permissions = userPermissions,
            AccessToken = accessToken.Token,
            RefreshToken = refreshToken,
            ExpiresAt = accessToken.ExpiresAt
        });

    }

    /// <summary>
    /// Renueva el Access Token y rota el Refresh Token.
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<ActionResult<LoginResponseDto>> RefreshToken(
        [FromBody] RefreshTokenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(new LoginResponseDto
            {
                Success = false,
                Message = "El Refresh Token es requerido."
            });
        }

        var tokenHash = _jwtTokenService.HashRefreshToken(
            request.RefreshToken
        );

        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        var now = DateTime.UtcNow;

        if (storedToken == null ||
            storedToken.IsRevoked ||
            storedToken.ExpiresAt <= now)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "Refresh Token inválido o expirado."
            });
        }

        var user = storedToken.User;

        if (!user.IsActive)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "La cuenta se encuentra inactiva."
            });
        }

        // Invalidar el Refresh Token anterior.
        storedToken.IsRevoked = true;
        storedToken.RevokedAt = now;

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

        // Generar nuevos tokens.
        var accessToken = _jwtTokenService.GenerateAccessToken(
            user,
            userRoles,
            userPermissions
        );

        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

        // Guardar únicamente el hash del nuevo Refresh Token.
        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwtTokenService.HashRefreshToken(newRefreshToken),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            ExpiresAt = now.AddDays(7)
        };

        _context.RefreshTokens.Add(newRefreshTokenEntity);

        await _context.SaveChangesAsync();

        return Ok(new LoginResponseDto
        {
            Success = true,
            Message = "Sesión renovada correctamente.",
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
            Permissions = userPermissions,
            AccessToken = accessToken.Token,
            RefreshToken = newRefreshToken,
            ExpiresAt = accessToken.ExpiresAt
        });
    }


    /// <summary>
    /// Cierra la sesión revocando el Refresh Token.
    /// </summary>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        [FromBody] RefreshTokenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(new
            {
                Success = false,
                Message = "El Refresh Token es requerido."
            });
        }

        var tokenHash = _jwtTokenService.HashRefreshToken(
            request.RefreshToken
        );

        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (storedToken != null && !storedToken.IsRevoked)
        {
            storedToken.IsRevoked = true;
            storedToken.RevokedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            Success = true,
            Message = "Sesión cerrada correctamente."
        });
    }

    /// <summary>
    /// Lista todos los roles y permisos del sistema.
    /// </summary>
    [HttpGet("roles")]
    [Authorize(Policy = "ROLES_MANAGE")]
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
    [Authorize(Policy = "USERS_READ")]
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
