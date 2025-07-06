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
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _authService = new AuthenticationService(configuration);
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

            // הוספת התפקידים לאובייקט Person
            var roleService = new RoleService(_configuration);
            var roles = roleService.GetPersonRoles(person.PersonId);

            // יצירת טוקן
            var token = GenerateJwtToken(person, roles);

            // הוספת התפקידים לתשובה
            var response = new
            {
                token = token,
                person = new
                {
                    personId = person.PersonId,
                    firstName = person.FirstName,
                    lastName = person.LastName,
                    email = person.Email,
                    departmentID = person.DepartmentID,
                    folderPath = person.FolderPath,
                    username = person.Username,
                    password = (string)null, // לא מחזירים סיסמה
                    position = person.Position,
                    isActive = person.IsActive,
                    createdDate = person.CreatedDate,
                    roles = roles // הוספת התפקידים!
                }
            };

            return Ok(response);
        }

        private string GenerateJwtToken(Person person, List<Role> roles)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

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


