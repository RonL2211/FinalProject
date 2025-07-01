using FinalProject.BL.Services;
using FinalProject.DAL.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;

namespace FinalProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PersonController : ControllerBase
    {
        private readonly PersonService _personService;

        public PersonController(IConfiguration configuration)
        {
            _personService = new PersonService(configuration);
        }

        /// <summary>
        /// קבלת כל המשתמשים - רק מנהל סטודנטים
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult GetAllPersons()
        {
            try
            {
                var persons = _personService.GetAllPersons();

                // הסרת סיסמאות מהתשובה
                foreach (var person in persons)
                {
                    person.Password = null;
                }

                return Ok(persons);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת משתמש לפי מזהה - המשתמש עצמו או מי שמורשה
        /// </summary>
        [HttpGet("{id}")]
        public IActionResult GetPersonById(string id)
        {
            try
            {
                var person = _personService.GetPersonById(id);
                if (person == null)
                    return NotFound($"Person with ID {id} not found");

                var currentUserId = User.Identity?.Name;
                var isAdmin = User.IsInRole("מנהל סטודנטים");

                // רק המשתמש עצמו או מנהל יכול לראות פרטים אישיים
                if (currentUserId != id && !isAdmin)
                    return Forbid("Not authorized to view this person's details");

                // הסרת סיסמה מהתשובה
                person.Password = null;

                return Ok(person);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// הוספת משתמש חדש - רק מנהל סטודנטים
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult AddPerson([FromBody] Person person)
        {
            try
            {
                if (person == null)
                    return BadRequest("Person data is null");

                var result = _personService.AddPerson(person);
                if (result > 0)
                {
                    // הסרת סיסמה מהתשובה
                    person.Password = null;
                    return CreatedAtAction(nameof(GetPersonById), new { id = person.PersonId }, person);
                }
                else
                {
                    return BadRequest("Failed to add person");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// עדכון משתמש - המשתמש עצמו או מנהל סטודנטים
        /// </summary>
        [HttpPut("{id}")]
        public IActionResult UpdatePerson(string id, [FromBody] Person person)
        {
            try
            {
                if (person == null)
                    return BadRequest("Person data is null");
                if (id != person.PersonId)
                    return BadRequest("ID mismatch");

                var existingPerson = _personService.GetPersonById(id);
                if (existingPerson == null)
                    return NotFound($"Person with ID {id} not found");

                var currentUserId = User.Identity?.Name;
                var isAdmin = User.IsInRole("מנהל סטודנטים");

                // רק המשתמש עצמו או מנהל יכול לעדכן
                if (currentUserId != id && !isAdmin)
                    return Forbid("Not authorized to update this person");

                var result = _personService.UpdatePerson(person);
                if (result > 0)
                {
                    person.Password = null;
                    return Ok(person);
                }
                else
                {
                    return BadRequest("Failed to update person");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת תפקידים של משתמש - המשתמש עצמו או מנהל
        /// </summary>
        [HttpGet("{id}/roles")]
        public IActionResult GetPersonRoles(string id)
        {
            try
            {
                var currentUserId = User.Identity?.Name;
                var isAdmin = User.IsInRole("מנהל סטודנטים");

                if (currentUserId != id && !isAdmin)
                    return Forbid("Not authorized to view this person's roles");

                var roles = _personService.GetPersonRoles(id);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// הקצאת תפקיד למשתמש - רק מנהל סטודנטים
        /// </summary>
        [HttpPost("{id}/roles/{roleId}")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult AssignRoleToPerson(string id, int roleId)
        {
            try
            {
                var existingPerson = _personService.GetPersonById(id);
                if (existingPerson == null)
                    return NotFound($"Person with ID {id} not found");

                var result = _personService.AssignRoleToPerson(id, roleId);
                if (result > 0)
                {
                    return Ok(new { Message = "Role assigned successfully" });
                }
                else
                {
                    return BadRequest("Failed to assign role to person");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// הסרת תפקיד ממשתמש - רק מנהל סטודנטים
        /// </summary>
        [HttpDelete("{id}/roles/{roleId}")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult RemoveRoleFromPerson(string id, int roleId)
        {
            try
            {
                var existingPerson = _personService.GetPersonById(id);
                if (existingPerson == null)
                    return NotFound($"Person with ID {id} not found");

                var result = _personService.RemoveRoleFromPerson(id, roleId);
                if (result > 0)
                {
                    return Ok(new { Message = "Role removed successfully" });
                }
                else
                {
                    return BadRequest("Failed to remove role from person");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}