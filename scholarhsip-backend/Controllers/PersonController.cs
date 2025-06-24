using FinalProject.BL.Services;
using FinalProject.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace FinalProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PersonController : ControllerBase
    {
        private readonly PersonService _personService;
        private readonly AuditTrailService _auditTrailService;

        public PersonController(IConfiguration configuration)
        {
            _personService = new PersonService(configuration);
            _auditTrailService = new AuditTrailService(configuration);
        }

        [HttpGet]
        public IActionResult GetAllPersons()
        {
            try
            {
                var persons = _personService.GetAllPersons();
                return Ok(persons);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetPersonById(string id)
        {
            try
            {
                var person = _personService.GetPersonById(id);
                if (person == null)
                    return NotFound($"Person with ID {id} not found");

                // להסרת בדיקת הרשאות – מאפשר צפייה לכל אחד
                return Ok(person);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddPerson([FromBody] Person person)
        {
            try
            {
                if (person == null)
                    return BadRequest("Person data is null");

                var result = _personService.AddPerson(person);
                if (result > 0)
                {
                    // עבור בדיקות – מסמנים את המשתמש כ-"Anonymous"
                    //await _auditTrailService.LogActionAsync(
                    //    "Anonymous",
                    //    "Create",
                    //    "Person",
                    //    int.Parse(person.PersonId),
                    //    $"Created new person: {person.FirstName} {person.LastName}"
                    //);

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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePerson(string id, [FromBody] Person person)
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

                var result = _personService.UpdatePerson(person);
                if (result > 0)
                {
                    await _auditTrailService.LogActionAsync(
                        "Anonymous",
                        "Update",
                        "Person",
                        int.Parse(person.PersonId),
                        $"Updated person: {person.FirstName} {person.LastName} {person.Username} {person.Email} {person.DepartmentID}{person.Position}{person.IsActive}"
                    );

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

        [HttpGet("{id}/roles")]
        public IActionResult GetPersonRoles(string id)
        {
            try
            {
                var roles = _personService.GetPersonRoles(id);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/roles/{roleId}")]
        public async Task<IActionResult> AssignRoleToPerson(string id, int roleId)
        {
            try
            {
                var existingPerson = _personService.GetPersonById(id);
                if (existingPerson == null)
                    return NotFound($"Person with ID {id} not found");

                var result = _personService.AssignRoleToPerson(id, roleId);
                if (result > 0)
                {
                    await _auditTrailService.LogActionAsync(
                        "Anonymous",
                        "AssignRole",
                        "Person",
                        int.Parse(id),
                        $"Assigned role ID {roleId} to person"
                    );

                    return Ok();
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

        [HttpDelete("{id}/roles/{roleId}")]
        public async Task<IActionResult> RemoveRoleFromPerson(string id, int roleId)
        {
            try
            {
                var existingPerson = _personService.GetPersonById(id);
                if (existingPerson == null)
                    return NotFound($"Person with ID {id} not found");

                var result = _personService.RemoveRoleFromPerson(id, roleId);
                if (result > 0)
                {
                    await _auditTrailService.LogActionAsync(
                        "Anonymous",
                        "RemoveRole",
                        "Person",
                        int.Parse(id),
                        $"Removed role ID {roleId} from person"
                    );

                    return Ok();
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
