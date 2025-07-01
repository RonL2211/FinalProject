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
    public class SectionFieldController : ControllerBase
    {
        private readonly FormService _formService;

        public SectionFieldController(IConfiguration configuration)
        {
            _formService = new FormService(configuration);
        }

        /// <summary>
        /// קבלת שדה לפי מזהה - לכולם
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public IActionResult GetFieldById(int id)
        {
            try
            {
                var field = _formService.GetFieldById(id);
                if (field == null)
                    return NotFound($"Field with ID {id} not found");

                return Ok(field);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// יצירת שדה חדש - רק מנהל סטודנטים
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult CreateField([FromBody] SectionField field)
        {
            try
            {
                if (field == null)
                    return BadRequest("Field data is null");

                var section = _formService.GetSectionById(field.SectionID.Value);
                if (section == null)
                    return NotFound($"Section with ID {field.SectionID} not found");

                var form = _formService.GetFormById(section.FormId);
                if (form.IsPublished)
                    return BadRequest("Cannot add fields to a published form");

                var fieldId = _formService.AddField(field);
                if (fieldId > 0)
                {
                    field.FieldID = fieldId;
                    return CreatedAtAction(nameof(GetFieldById), new { id = fieldId }, field);
                }
                else
                {
                    return BadRequest("Failed to create field");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// עדכון שדה - רק מנהל סטודנטים
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult UpdateField(int id, [FromBody] SectionField field)
        {
            try
            {
                if (field == null)
                    return BadRequest("Field data is null");
                if (id != field.FieldID)
                    return BadRequest("ID mismatch");

                var existingField = _formService.GetFieldById(id);
                if (existingField == null)
                    return NotFound($"Field with ID {id} not found");

                var section = _formService.GetSectionById(existingField.SectionID.Value);
                var form = _formService.GetFormById(section.FormId);
                if (form.IsPublished)
                    return BadRequest("Cannot update fields in a published form");

                var result = _formService.UpdateField(field);
                if (result > 0)
                {
                    return Ok(field);
                }
                else
                {
                    return BadRequest("Failed to update field");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// מחיקת שדה - רק מנהל סטודנטים
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult DeleteField(int id)
        {
            try
            {
                var field = _formService.GetFieldById(id);
                if (field == null)
                    return NotFound($"Field with ID {id} not found");

                var section = _formService.GetSectionById(field.SectionID.Value);
                var form = _formService.GetFormById(section.FormId);
                if (form.IsPublished)
                    return BadRequest("Cannot delete fields from a published form");

                var result = _formService.DeleteField(id);
                if (result > 0)
                {
                    return Ok(new { Message = "Field deleted successfully" });
                }
                else
                {
                    return BadRequest("Failed to delete field");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת אפשרויות של שדה - לכולם
        /// </summary>
        [HttpGet("{id}/options")]
        [AllowAnonymous]
        public IActionResult GetFieldOptions(int id)
        {
            try
            {
                var field = _formService.GetFieldById(id);
                if (field == null)
                    return NotFound($"Field with ID {id} not found");

                var options = _formService.GetFieldOptions(id);
                return Ok(options);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// הוספת אפשרות לשדה - רק מנהל סטודנטים
        /// </summary>
        [HttpPost("options")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult AddFieldOption([FromBody] FieldOption option)
        {
            try
            {
                if (option == null)
                    return BadRequest("Option data is null");

                var field = _formService.GetFieldById(option.FieldID);
                if (field == null)
                    return NotFound($"Field with ID {option.FieldID} not found");

                var section = _formService.GetSectionById(field.SectionID.Value);
                var form = _formService.GetFormById(section.FormId);
                if (form.IsPublished)
                    return BadRequest("Cannot add options to a published form");

                var optionId = _formService.AddFieldOption(option);
                if (optionId > 0)
                {
                    option.OptionID = optionId;
                    return CreatedAtAction(nameof(GetFieldOptions), new { id = option.FieldID }, option);
                }
                else
                {
                    return BadRequest("Failed to create option");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// עדכון אפשרות - רק מנהל סטודנטים
        /// </summary>
        [HttpPut("options/{id}")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult UpdateFieldOption(int id, [FromBody] FieldOption option)
        {
            try
            {
                if (option == null)
                    return BadRequest("Option data is null");
                if (id != option.OptionID)
                    return BadRequest("ID mismatch");

                var field = _formService.GetFieldById(option.FieldID);
                if (field == null)
                    return NotFound($"Field with ID {option.FieldID} not found");

                var section = _formService.GetSectionById(field.SectionID.Value);
                var form = _formService.GetFormById(section.FormId);
                if (form.IsPublished)
                    return BadRequest("Cannot update options in a published form");

                var result = _formService.UpdateFieldOption(option);
                if (result > 0)
                {
                    return Ok(option);
                }
                else
                {
                    return BadRequest("Failed to update option");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// מחיקת אפשרות - רק מנהל סטודנטים
        /// </summary>
        [HttpDelete("options/{id}")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult DeleteFieldOption(int id)
        {
            try
            {
                var option = _formService.GetFieldOptionById(id);
                if (option == null)
                    return NotFound($"Option with ID {id} not found");

                var field = _formService.GetFieldById(option.FieldID);
                var section = _formService.GetSectionById(field.SectionID.Value);
                var form = _formService.GetFormById(section.FormId);
                if (form.IsPublished)
                    return BadRequest("Cannot delete options from a published form");

                var result = _formService.DeleteFieldOption(id);
                if (result > 0)
                {
                    return Ok(new { Message = "Option deleted successfully" });
                }
                else
                {
                    return BadRequest("Failed to delete option");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}