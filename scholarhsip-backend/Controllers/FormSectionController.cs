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
    public class FormSectionController : ControllerBase
    {
        private readonly FormService _formService;

        public FormSectionController(IConfiguration configuration)
        {
            _formService = new FormService(configuration);
        }

        /// <summary>
        /// קבלת סעיפים של טופס - לכולם (אבל רק טפסים מפורסמים למשתמשים רגילים)
        /// </summary>
        [HttpGet("form/{formId}")]
        [AllowAnonymous]
        public IActionResult GetSectionsByFormId(int formId)
        {
            try
            {
                var form = _formService.GetFormById(formId);
                if (form == null)
                    return NotFound($"Form with ID {formId} not found");

                var currentUserId = User.Identity?.Name;
                var isAdmin = !string.IsNullOrEmpty(currentUserId) && User.IsInRole("מנהל סטודנטים");

                // בדיקת הרשאות - רק מפורסמים למשתמשים רגילים
                if (!isAdmin && (!form.IsPublished || !form.IsActive))
                    return Forbid("This form is not available");

                var sections = _formService.GetFormStructure(formId);
                return Ok(sections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת שדות של סעיף - לכולם
        /// </summary>
        [HttpGet("{id}/fields")]
        [AllowAnonymous]
        public IActionResult GetSectionFields(int id)
        {
            try
            {
                var section = _formService.GetSectionById(id);
                if (section == null)
                    return NotFound($"Section with ID {id} not found");

                var form = _formService.GetFormById(section.FormId);
                var currentUserId = User.Identity?.Name;
                var isAdmin = !string.IsNullOrEmpty(currentUserId) && User.IsInRole("מנהל סטודנטים");

                // בדיקת הרשאות
                if (!isAdmin && (!form.IsPublished || !form.IsActive))
                    return Forbid("This section is not available");

                var fields = _formService.GetSectionFields(id);
                return Ok(fields);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// יצירת סעיף חדש - רק מנהל סטודנטים
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult CreateSection([FromBody] FormSection section)
        {
            try
            {
                if (section == null)
                    return BadRequest("Section data is null");

                var form = _formService.GetFormById(section.FormId);
                if (form == null)
                    return NotFound($"Form with ID {section.FormId} not found");

                // אם הטופס כבר מפורסם, לא ניתן להוסיף סעיפים
                if (form.IsPublished)
                    return BadRequest("Cannot add sections to a published form");

                var sectionId = _formService.AddSection(section);
                if (sectionId > 0)
                {
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
        /// עדכון סעיף - רק מנהל סטודנטים
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult UpdateSection(int id, [FromBody] FormSection section)
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
                if (form.IsPublished)
                    return BadRequest("Cannot update sections in a published form");

                var result = _formService.UpdateSection(section);
                if (result > 0)
                {
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
        /// מחיקת סעיף - רק מנהל סטודנטים
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult DeleteSection(int id)
        {
            try
            {
                var section = _formService.GetSectionById(id);
                if (section == null)
                    return NotFound($"Section with ID {id} not found");

                var form = _formService.GetFormById(section.FormId);
                if (form.IsPublished)
                    return BadRequest("Cannot delete sections from a published form");

                var result = _formService.DeleteSection(id);
                if (result > 0)
                {
                    return Ok(new { Message = "Section deleted successfully" });
                }

                return BadRequest("Failed to delete section");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetSectionById(int id)
        {
            try
            {
                var section = _formService.GetSectionById(id);
                if (section == null)
                    return NotFound($"Section with ID {id} not found");

                return Ok(section);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
