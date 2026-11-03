
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using RPAGB.Domain.Entities;

namespace RPAGB.Api.Services;

public class JwtTokenService
{
    private readonly IConfiguration _configuration;
    private readonly byte[] _key;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;

        var encodedKey = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key no configurada.");

        _key = Convert.FromBase64String(encodedKey);
    }

    public (string Token, DateTime ExpiresAt) GenerateAccessToken(
        User user,
        IEnumerable<string> roles,
        IEnumerable<string> permissions)
    {
        var expirationMinutes = int.Parse(
            _configuration["Jwt:AccessTokenExpirationMinutes"] ?? "15"
        );

        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.GivenName, user.FirstName),
            new(ClaimTypes.Surname, user.LastName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(
            roles.Distinct().Select(role =>
                new Claim(ClaimTypes.Role, role))
        );

        claims.AddRange(
            permissions.Distinct().Select(permission =>
                new Claim("permission", permission))
        );

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(_key),
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);

        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    public string HashRefreshToken(string refreshToken)
    {
        var tokenBytes = Encoding.UTF8.GetBytes(refreshToken);
        var hashBytes = SHA256.HashData(tokenBytes);

        return Convert.ToHexString(hashBytes);
    }
}
