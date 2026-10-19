namespace RPAGB.Application.DTOs.Auth;

public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public UserDto? User { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class DbHealthCheckDto
{
    public bool DatabaseConnected { get; set; }
    public string DatabaseName { get; set; } = string.Empty;
    public int UsersCount { get; set; }
    public int RolesCount { get; set; }
    public int PermissionsCount { get; set; }
    public List<string> SeededRoles { get; set; } = new();
}
