//AppealController.cs
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
    public class AppealController : ControllerBase
    {
        private readonly AppealService _appealService;

        public AppealController(IConfiguration configuration)
        {
            _appealService = new AppealService(configuration);
        }

        /// <summary>
        /// יצירת ערעור חדש על מופע טופס
        /// </summary>
        [HttpPost]
        public IActionResult CreateAppeal([FromBody] CreateAppealModel model)
        {
            try
            {
                if (model == null || model.InstanceId <= 0 || string.IsNullOrEmpty(model.AppealReason))
                    return BadRequest("Instance ID and appeal reason are required");

                var currentUserId = User.Identity?.Name;
                if (string.IsNullOrEmpty(currentUserId))
                    return Unauthorized();

                var appealId = _appealService.CreateAppeal(model.InstanceId, model.AppealReason, currentUserId);

                if (appealId > 0)
                {
                    return Ok(new { AppealId = appealId, Message = "Appeal created successfully" });
                }
                else
                {
                    return BadRequest("Failed to create appeal");
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת כל הערעורים הממתינים (רק למנהל סטודנטים)
        /// </summary>
        [HttpGet("pending")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult GetPendingAppeals()
        {
            try
            {
                var currentUserId = User.Identity?.Name;
                var appeals = _appealService.GetPendingAppealsForUser(currentUserId);
                return Ok(appeals);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת ערעור לפי מזהה
        /// </summary>
        [HttpGet("{id}")]
        public IActionResult GetAppealById(int id)
        {
            try
            {
                var appeal = _appealService.GetAppealById(id);
                if (appeal == null)
                    return NotFound($"Appeal with ID {id} not found");

                return Ok(appeal);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// מענה על ערעור (רק למנהל סטודנטים)
        /// </summary>
        [HttpPost("{id}/respond")]
        [Authorize(Roles = "מנהל סטודנטים")]
        public IActionResult RespondToAppeal(int id, [FromBody] RespondToAppealModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.ReviewerResponse))
                    return BadRequest("Reviewer response is required");

                var currentUserId = User.Identity?.Name;
                if (string.IsNullOrEmpty(currentUserId))
                    return Unauthorized();

                var result = _appealService.RespondToAppeal(id, model.IsApproved, model.ReviewerResponse, currentUserId);

                if (result > 0)
                {
                    string statusMessage = model.IsApproved ? "Appeal approved" : "Appeal rejected";
                    return Ok(new { Message = statusMessage });
                }
                else
                {
                    return BadRequest("Failed to respond to appeal");
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת ערעורים לפי מופע טופס
        /// </summary>
        [HttpGet("instance/{instanceId}")]
        public IActionResult GetAppealsByInstanceId(int instanceId)
        {
            try
            {
                var appeals = _appealService.GetAppealsByInstanceId(instanceId);
                return Ok(appeals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// בדיקה האם משתמש יכול לערער על מופע מסוים
        /// </summary>
        [HttpGet("can-appeal/{instanceId}")]
        public IActionResult CanUserAppeal(int instanceId)
        {
            try
            {
                var currentUserId = User.Identity?.Name;
                if (string.IsNullOrEmpty(currentUserId))
                    return Unauthorized();

                var canAppeal = _appealService.CanUserAppeal(instanceId, currentUserId);
                return Ok(new { CanAppeal = canAppeal });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    // Models for requests
    public class CreateAppealModel
    {
        public int InstanceId { get; set; }
        public string AppealReason { get; set; }
    }

    public class RespondToAppealModel
    {
        public bool IsApproved { get; set; }
        public string ReviewerResponse { get; set; }
    }
}