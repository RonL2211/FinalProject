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
    public class FormController : ControllerBase
    {
        private readonly FormService _formService;
        private readonly FormValidationService _validationService;
        private readonly RoleService _roleService;
        private readonly AuditTrailService _auditTrailService;

        public FormController(IConfiguration configuration)
        {
            _formService = new FormService(configuration);
            _validationService = new FormValidationService(configuration);
            _roleService = new RoleService(configuration);
            _auditTrailService = new AuditTrailService(configuration);
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAllForms()
        {
            var forms = _formService.GetAllForms();
            return Ok(forms);
        }

        /// <summary>
        /// NOW OPEN TO EVERYONE: always returns the form, no 403
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public IActionResult GetFormById(int id)
        {
            try
            {
                var form = _formService.GetFormById(id);
                if (form == null)
                    return NotFound($"Form with ID {id} not found");

                // NO more published-check or role-check here
                return Ok(form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("academicYear/{year}")]
        public IActionResult GetFormsByAcademicYear(string year)
        {
            try
            {
                var forms = _formService.GetFormsByAcademicYear(year);

                var currentUserId = User.Identity?.Name;
                var isAdmin = !string.IsNullOrEmpty(currentUserId) && User.IsInRole("Admin");
                var isCommitteeMember =
                    !string.IsNullOrEmpty(currentUserId)
                    && _roleService.IsCommitteeMember(currentUserId);

                if (!isAdmin && !isCommitteeMember)
                    forms = forms.FindAll(f => f.IsPublished && f.IsActive);

                return Ok(forms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateForm([FromBody] Form form)
        {
            try
            {
                if (form == null)
                    return BadRequest("Form data is null");

                var formId = _formService.CreateForm(form);
                if (formId <= 0)
                    return BadRequest("Failed to create form");

                await _auditTrailService.LogActionAsync(
                    form.CreatedBy, "Create", "Form", formId, $"Created: {form.FormName}"
                );

                form.FormID = formId;
                return CreatedAtAction(nameof(GetFormById), new { id = formId }, form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateForm(int id, [FromBody] Form form)
        {
            try
            {
                if (form == null) return BadRequest("Form data is null");
                if (id != form.FormID) return BadRequest("ID mismatch");

                var existing = _formService.GetFormById(id);
                if (existing == null) return NotFound($"Form {id} not found");

                var currentUserId = User.Identity?.Name;
                form.LastModifiedBy = currentUserId;

                var result = _formService.UpdateForm(form);
                if (result <= 0) return BadRequest("Failed to update form");

                await _auditTrailService.LogActionAsync(
                    currentUserId, "Update", "Form", id, $"Updated: {form.FormName}"
                );

                return Ok(form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/publish")]
        public async Task<IActionResult> PublishForm(int id, [FromBody] string currentUserId)
        {
            try
            {
                var form = _formService.GetFormById(id);
                if (form == null) return NotFound($"Form {id} not found");

                var errors = _validationService.ValidateFormStructure(id);
                if (errors.Count > 0) return BadRequest(errors);

                var result = _formService.PublishForm(id, currentUserId);
                if (result <= 0) return BadRequest("Failed to publish");

                await _auditTrailService.LogActionAsync(
                    currentUserId, "Publish", "Form", id, $"Published: {form.FormName}"
                );

                return Ok(new { Message = "Published successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/structure")]
        public IActionResult GetFormStructure(int id)
        {
            try
            {
                var structure = _formService.GetFormSectionHierarchy(id);
                return Ok(structure);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("validate/{id}")]
        public IActionResult ValidateForm(int id)
        {
            try
            {
                var errors = _validationService.ValidateFormStructure(id);
                return Ok(new { IsValid = errors.Count == 0, Errors = errors });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
