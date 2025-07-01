using FinalProject.BL.Services;
using FinalProject.DAL.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FormController : ControllerBase
    {
        private readonly FormService _formService;
        private readonly FormValidationService _validationService;
        private readonly RoleService _roleService;

        public FormController(IConfiguration configuration)
        {
            _formService = new FormService(configuration);
            _validationService = new FormValidationService(configuration);
            _roleService = new RoleService(configuration);
        }

        /// <summary>
        /// קבלת כל הטפסים - לכולם (גם אנונימיים יכולים לראות טפסים מפורסמים)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAllForms()
        {
            var forms = _formService.GetAllForms();

            var currentUserId = User.Identity?.Name;
            var isAdmin = !string.IsNullOrEmpty(currentUserId) && User.IsInRole("מנהל סטודנטים");

            // אם לא מנהל - מציג רק טפסים מפורסמים ופעילים
            if (!isAdmin)
            {
                forms = forms.FindAll(f => f.IsPublished && f.IsActive);
            }

            return Ok(forms);
        }

        /// <summary>
        /// קבלת טופס לפי מזהה - לכולם
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

                var currentUserId = User.Identity?.Name;
                var isAdmin = !string.IsNullOrEmpty(currentUserId) && User.IsInRole("מנהל סטודנטים");

                // אם לא מנהל - יכול לראות רק טפסים מפורסמים ופעילים
                if (!isAdmin && (!form.IsPublished || !form.IsActive))
                {
                    return Forbid("This form is not available");
                }

                return Ok(form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// יצירת טופס חדש - רק מנהל סטודנטים
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult CreateForm([FromBody] Form form)
        {
            try
            {
                if (form == null)
                    return BadRequest("Form data is null");

                var currentUserId = User.Identity?.Name;
                form.CreatedBy = currentUserId;

                var formId = _formService.CreateForm(form);
                if (formId <= 0)
                    return BadRequest("Failed to create form");

                form.FormID = formId;
                return CreatedAtAction(nameof(GetFormById), new { id = formId }, form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// עדכון טופס - רק מנהל סטודנטים
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult UpdateForm(int id, [FromBody] Form form)
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

                return Ok(form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// פרסום טופס - רק מנהל סטודנטים
        /// </summary>
        [HttpPost("{id}/publish")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult PublishForm(int id)
        {
            try
            {
                var form = _formService.GetFormById(id);
                if (form == null) return NotFound($"Form {id} not found");

                var errors = _validationService.ValidateFormStructure(id);
                if (errors.Count > 0) return BadRequest(errors);

                var currentUserId = User.Identity?.Name;
                var result = _formService.PublishForm(id, currentUserId);
                if (result <= 0) return BadRequest("Failed to publish");

                return Ok(new { Message = "Published successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת מבנה טופס (סעיפים ושדות) - לכולם
        /// </summary>
        [HttpGet("{id}/structure")]
        [AllowAnonymous]
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

        /// <summary>
        /// וולידציה של טופס - רק מנהל סטודנטים
        /// </summary>
        [HttpGet("validate/{id}")]
        [Authorize(Roles = "מנהל סטודנטים")]
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
