// Controllers/FormSectionController.cs
using FinalProject.BL.Services;
using FinalProject.DAL.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormSectionController : ControllerBase
    {
        private readonly FormService _formService;
        private readonly SectionPermissionService _permissionService;
        private readonly AuditTrailService _auditTrailService;

        public FormSectionController(IConfiguration configuration)
        {
            _formService = new FormService(configuration);
            _permissionService = new SectionPermissionService(configuration);
            _auditTrailService = new AuditTrailService(configuration);
        }

        /// <summary>
        /// Returns all sections for a given form. (Open to anonymous)
        /// </summary>
        [HttpGet("form/{formId}")]
        [AllowAnonymous]
        public IActionResult GetSectionsByFormId(int formId)
        {
            try
            {
                // Simply return the hierarchy for that form
                var sections = _formService.GetFormStructure(formId);
                return Ok(sections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Returns all fields for a given section. (Open to anonymous)
        /// </summary>
        [HttpGet("{id}/fields")]
        [AllowAnonymous]
        public IActionResult GetSectionFields(int id)
        {
            try
            {
                var fields = _formService.GetSectionFields(id);
                return Ok(fields);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Returns a single section by ID, with permission checks.
        /// </summary>
        [HttpGet("{id}")]
        public IActionResult GetSectionById(int id)
        {
            try
            {
                var currentUserId = User.Identity.Name;
                var isAdmin = User.IsInRole("Admin");
                var isCommitteeMember = User.IsInRole("CommitteeMember");

                var section = _formService.GetSectionById(id);
                if (section == null)
                    return NotFound($"Section with ID {id} not found");

                if (!isAdmin
                    && !isCommitteeMember
                    && !_permissionService.CanViewSection(currentUserId, id))
                {
                    return Forbid();
                }

                return Ok(section);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Creates a new section under a form.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateSection([FromBody] FormSection section)
        {
            try
            {
                if (section == null)
                    return BadRequest("Section data is null");

                var form = _formService.GetFormById(section.FormId);
                if (form == null)
                    return NotFound($"Form with ID {section.FormId} not found");
                //if (form.IsPublished)
                //    return BadRequest("Cannot add sections to a published form");

                var sectionId = _formService.AddSection(section);
                if (sectionId > 0)
                {
                    var currentUserId = User.Identity.Name;
                    await _auditTrailService.LogActionAsync(
                        currentUserId,
                        "Create",
                        "FormSection",
                        sectionId,
                        $"Created new section: {section.Title} for form {section.FormId}"
                    );

                    section.SectionID = sectionId;
                    return CreatedAtAction(nameof(GetSectionById), new { id = sectionId }, section);
                }

                return BadRequest("Failed to create section");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates an existing section.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSection(int id, [FromBody] FormSection section)
        {
            try
            {
                if (section == null)
                    return BadRequest("Section data is null");
                if (id != section.SectionID)
                    return BadRequest("ID mismatch");

                var existingSection = _formService.GetSectionById(id);
                if (existingSection == null)
                    return NotFound($"Section with ID {id} not found");

                var form = _formService.GetFormById(existingSection.FormId);
                if (form == null)
                    return NotFound($"Form with ID {existingSection.FormId} not found");
                //if (form.IsPublished)
                //    return BadRequest("Cannot update sections in a published form");

                var result = _formService.UpdateSection(section);
                if (result > 0)
                {
                    var currentUserId = User.Identity.Name;
                    await _auditTrailService.LogActionAsync(
                        currentUserId,
                        "Update",
                        "FormSection",
                        id,
                        $"Updated section: {section.Title}"
                    );

                    return Ok(section);
                }

                return BadRequest("Failed to update section");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes a section by ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSection(int id)
        {
            try
            {
                var section = _formService.GetSectionById(id);
                if (section == null)
                    return NotFound($"Section with ID {id} not found");

                var form = _formService.GetFormById(section.FormId);
                if (form == null)
                    return NotFound($"Form with ID {section.FormId} not found");
                if (form.IsPublished)
                    return BadRequest("Cannot delete sections from a published form");

                var result = _formService.DeleteSection(id);
                if (result > 0)
                {
                    var currentUserId = User.Identity.Name;
                    await _auditTrailService.LogActionAsync(
                        currentUserId,
                        "Delete",
                        "FormSection",
                        id,
                        $"Deleted section: {section.Title}"
                    );

                    return Ok(new { Message = "Section deleted successfully" });
                }

                return BadRequest("Failed to delete section");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Assigns a permission to this section.
        /// </summary>
        [HttpPost("{id}/permissions")]
        public async Task<IActionResult> AssignSectionPermission(int id, [FromBody] SectionPermission permission)
        {
            try
            {
                if (permission == null)
                    return BadRequest("Permission data is null");
                if (id != permission.SectionID)
                    return BadRequest("Section ID mismatch");

                var result = _permissionService.AssignPermission(permission);
                if (result > 0)
                {
                    var currentUserId = User.Identity.Name;
                    await _auditTrailService.LogActionAsync(
                        currentUserId,
                        "AssignPermission",
                        "FormSection",
                        id,
                        $"Assigned permission to section for person {permission.ResponsiblePerson}"
                    );

                    return Ok(permission);
                }

                return BadRequest("Failed to assign permission");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Removes a previously assigned permission.
        /// </summary>
        [HttpDelete("permissions/{permissionId}")]
        public async Task<IActionResult> RemoveSectionPermission(int permissionId)
        {
            try
            {
                var result = _permissionService.RemovePermission(permissionId);
                if (result > 0)
                {
                    var currentUserId = User.Identity.Name;
                    await _auditTrailService.LogActionAsync(
                        currentUserId,
                        "RemovePermission",
                        "SectionPermission",
                        permissionId,
                        $"Removed section permission"
                    );

                    return Ok(new { Message = "Permission removed successfully" });
                }

                return BadRequest("Failed to remove permission");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
