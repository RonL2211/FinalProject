// Controllers/FormSubSectionController.cs
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
    public class FormSubSectionController : ControllerBase
    {
        private readonly FormSubSectionService _formSubSectionService;
        private readonly AuditTrailService _auditTrailService;

        public FormSubSectionController(IConfiguration configuration)
        {
            _formSubSectionService = new FormSubSectionService(configuration);
            _auditTrailService = new AuditTrailService(configuration);
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAllFormSubSections()
        {
            try
            {
                var subSections = _formSubSectionService.GetAllFormSubSections();
                return Ok(subSections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public IActionResult GetFormSubSectionById(int id)
        {
            try
            {
                var subSection = _formSubSectionService.GetFormSubSectionById(id);
                if (subSection == null)
                    return NotFound($"FormSubSection with ID {id} not found");

                return Ok(subSection);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("form/{formId}")]
        [AllowAnonymous]
        public IActionResult GetFormSubSectionsByFormId(int formId)
        {
            try
            {
                var subSections = _formSubSectionService.GetFormSubSectionsByFormId(formId);
                return Ok(subSections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Returns all sub-sections under a given section (no auth required).
        /// </summary>
        [HttpGet("section/{sectionId}")]
        [AllowAnonymous]
        public IActionResult GetFormSubSectionsBySectionId(int sectionId)
        {
            try
            {
                var subSections = _formSubSectionService.GetFormSubSectionsBySectionId(sectionId);
                return Ok(subSections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddFormSubSection([FromBody] FormSubSection subSection)
        {
            try
            {
                if (subSection == null)
                    return BadRequest("FormSubSection data is null");

                var result = _formSubSectionService.AddFormSubSection(subSection);
                if (result > 0)
                {
                    await _auditTrailService.LogActionAsync(
                        "Anonymous",
                        "Create",
                        "FormSubSection",
                        subSection.SubSectionID,
                        $"Created new subsection: {subSection.Title}"
                    );
                    return CreatedAtAction(nameof(GetFormSubSectionById), new { id = subSection.SubSectionID }, subSection);
                }

                return BadRequest("Failed to add FormSubSection");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFormSubSection(int id, [FromBody] FormSubSection subSection)
        {
            try
            {
                if (subSection == null)
                    return BadRequest("FormSubSection data is null");
                if (id != subSection.SubSectionID)
                    return BadRequest("ID mismatch");

                var existing = _formSubSectionService.GetFormSubSectionById(id);
                if (existing == null)
                    return NotFound($"FormSubSection with ID {id} not found");

                var result = _formSubSectionService.UpdateFormSubSection(subSection);
                if (result > 0)
                {
                    await _auditTrailService.LogActionAsync(
                        "Anonymous",
                        "Update",
                        "FormSubSection",
                        id,
                        $"Updated subsection: {subSection.Title}"
                    );
                    return Ok(subSection);
                }

                return BadRequest("Failed to update FormSubSection");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormSubSection(int id)
        {
            try
            {
                var existing = _formSubSectionService.GetFormSubSectionById(id);
                if (existing == null)
                    return NotFound($"FormSubSection with ID {id} not found");

                var result = _formSubSectionService.DeleteFormSubSection(id);
                if (result > 0)
                {
                    await _auditTrailService.LogActionAsync(
                        "Anonymous",
                        "Delete",
                        "FormSubSection",
                        id,
                        $"Deleted subsection: {existing.Title}"
                    );
                    return Ok();
                }

                return BadRequest("Failed to delete FormSubSection");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
