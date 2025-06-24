using FinalProject.BL.Services;
using FinalProject.DAL.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace FinalProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthenticationService _authService;
        private readonly AuditTrailService _auditTrailService;
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _authService = new AuthenticationService(configuration);
            _auditTrailService = new AuditTrailService(configuration);
            _configuration = configuration;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (string.IsNullOrEmpty(model.PersonId) || string.IsNullOrEmpty(model.Password))
                return BadRequest("PersonId and password are required");

            var person = _authService.Authenticate(model.PersonId, model.Password);
            if (person == null)
                return Unauthorized("Invalid personId or password");

            var token = GenerateJwtToken(person);

            await _auditTrailService.LogActionAsync(
                person.PersonId,
                "Login",
                "Auth",
                0,
                $"User logged in: {person.PersonId}"
            );

            // תשובה מחזירה את הטוקן ואת המידע במפתח "person" (camelCase)
            return Ok(new { token = token, person = person });
        }

        [HttpPost("logout")]
        [AllowAnonymous]
        public async Task<IActionResult> Logout()
        {
            var currentUserId = User?.Identity?.Name ?? "Anonymous";

            await _auditTrailService.LogActionAsync(
                currentUserId,
                "Logout",
                "Auth",
                0,
                "User logged out"
            );

            return Ok(new { Message = "Logout successful" });
        }

        private string GenerateJwtToken(Person person)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var roleService = new RoleService(_configuration);
            var roles = roleService.GetPersonRoles(person.PersonId);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, person.PersonId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, person.PersonId),
                new Claim("personId", person.PersonId)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role.RoleName));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginModel
    {
        public string PersonId { get; set; }
        public string Password { get; set; }
    }
}


