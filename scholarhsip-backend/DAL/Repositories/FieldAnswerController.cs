// FieldAnswerController.cs - Controller מתוקן עם Repository
using FinalProject.BL.Services;
using FinalProject.DAL.Models;
using FinalProject.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FinalProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FieldAnswerController : ControllerBase
    {
        private readonly FieldAnswerRepository _answerRepository;
        private readonly FormInstanceService _instanceService;
        private readonly PersonService _personService;

        public FieldAnswerController(IConfiguration configuration)
        {
            _answerRepository = new FieldAnswerRepository(configuration);
            _instanceService = new FormInstanceService(configuration);
            _personService = new PersonService(configuration);
        }

        /// <summary>
        /// שמירת תשובות למופע טופס
        /// </summary>
        [HttpPost("instance/{instanceId}/answers")]
        public IActionResult SaveFieldAnswers(int instanceId, [FromBody] SaveAnswersModel model)
        {
            try
            {
                var currentUserId = User.Identity?.Name;

                // בדיקת הרשאות - רק בעל המופע יכול לשמור תשובות
                var instance = _instanceService.GetInstanceById(instanceId);
                if (instance == null)
                    return NotFound($"Instance with ID {instanceId} not found");

                if (instance.UserID != currentUserId)
                    return Forbid("You can only save answers to your own form instances");

                // בדיקה שהמופע לא הוגש כבר
                if (instance.CurrentStage != "Draft")
                    return BadRequest("Cannot modify submitted form");

                // שמירת התשובות
                var answersToSave = new List<FieldAnswerInstance>();
                foreach (var answer in model.Answers)
                {
                    answersToSave.Add(new FieldAnswerInstance
                    {
                        InstanceId = instanceId,
                        FieldID = answer.FieldID,
                        Answer = answer.AnswerValue ?? ""
                    });
                }

                int savedCount = _answerRepository.SaveMultipleAnswers(instanceId, answersToSave);

                return Ok(new
                {
                    Message = "Answers saved successfully",
                    SavedCount = savedCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת תשובות של מופע טופס
        /// </summary>
        [HttpGet("instance/{instanceId}")]
        public IActionResult GetInstanceAnswers(int instanceId)
        {
            try
            {
                var currentUserId = User.Identity?.Name;

                // בדיקת הרשאות
                var instance = _instanceService.GetInstanceById(instanceId);
                if (instance == null)
                    return NotFound($"Instance with ID {instanceId} not found");

                // רק בעל המופע או מי שמורשה לבדוק יכול לראות
                if (!CanUserViewInstance(currentUserId, instance))
                    return Forbid("Not authorized to view these answers");

                var answers = _answerRepository.GetAnswersByInstanceId(instanceId);

                // המרה לפורמט שהלקוח מצפה לו
                var result = answers.Select(a => new
                {
                    fieldID = a.FieldID,
                    answerValue = a.Answer,
                    answerDate = a.AnswerDate,
                    updateDate = a.UpdateDate
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת תשובה ספציפית
        /// </summary>
        [HttpGet("instance/{instanceId}/field/{fieldId}")]
        public IActionResult GetFieldAnswer(int instanceId, int fieldId)
        {
            try
            {
                var currentUserId = User.Identity?.Name;

                // בדיקת הרשאות
                var instance = _instanceService.GetInstanceById(instanceId);
                if (instance == null)
                    return NotFound($"Instance with ID {instanceId} not found");

                if (!CanUserViewInstance(currentUserId, instance))
                    return Forbid("Not authorized to view this answer");

                var answer = _answerRepository.GetAnswer(instanceId, fieldId);
                if (answer == null)
                    return NotFound("Answer not found");

                return Ok(new
                {
                    fieldID = answer.FieldID,
                    answerValue = answer.Answer,
                    answerDate = answer.AnswerDate,
                    updateDate = answer.UpdateDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// מחיקת תשובה
        /// </summary>
        [HttpDelete("instance/{instanceId}/field/{fieldId}")]
        public IActionResult DeleteAnswer(int instanceId, int fieldId)
        {
            try
            {
                var currentUserId = User.Identity?.Name;

                var instance = _instanceService.GetInstanceById(instanceId);
                if (instance == null)
                    return NotFound($"Instance with ID {instanceId} not found");

                if (instance.UserID != currentUserId)
                    return Forbid("You can only delete your own answers");

                if (instance.CurrentStage != "Draft")
                    return BadRequest("Cannot modify submitted form");

                int affected = _answerRepository.DeleteAnswer(instanceId, fieldId);

                if (affected > 0)
                    return Ok(new { Message = "Answer deleted successfully" });
                else
                    return NotFound("Answer not found");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת סטטיסטיקות מילוי
        /// </summary>
        [HttpGet("instance/{instanceId}/statistics")]
        public IActionResult GetAnswerStatistics(int instanceId)
        {
            try
            {
                var currentUserId = User.Identity?.Name;

                var instance = _instanceService.GetInstanceById(instanceId);
                if (instance == null)
                    return NotFound($"Instance with ID {instanceId} not found");

                if (!CanUserViewInstance(currentUserId, instance))
                    return Forbid("Not authorized to view statistics");

                var stats = _answerRepository.GetAnswerStatistics(instanceId);

                return Ok(new
                {
                    totalFields = stats.TotalFields,
                    answeredFields = stats.AnsweredFields,
                    requiredFieldsAnswered = stats.RequiredFieldsAnswered,
                    completionPercentage = stats.CompletionPercentage,
                    lastUpdateDate = stats.LastUpdateDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #region Private Methods

        private bool CanUserViewInstance(string userId, FormInstance instance)
        {
            // בעל המופע יכול תמיד לראות
            if (instance.UserID == userId)
                return true;

            // בדיקת הרשאות לפי תפקיד
            var userRoles = _personService.GetPersonRoles(userId);

            // מנהל סטודנטים יכול לראות הכל
            if (userRoles.Any(r => r.RoleName == "מנהל סטודנטים"))
                return true;

            // ראש מחלקה יכול לראות של המחלקה שלו
            if (userRoles.Any(r => r.RoleName == "ראש מחלקה"))
            {
                var user = _personService.GetPersonById(userId);
                var instanceOwner = _personService.GetPersonById(instance.UserID);
                if (user.DepartmentID == instanceOwner.DepartmentID)
                    return true;
            }

            //// דיקאן יכול לראות של הפקולטה שלו
            //if (userRoles.Any(r => r.RoleName == "דיקאן"))
            //{
            //    // TODO: בדיקת פקולטה
            //    return true;
            //}

            return false;
        }

        #endregion
    }

    // Models for requests/responses
    public class SaveAnswersModel
    {
        public List<FieldAnswerModel> Answers { get; set; }
    }

    public class FieldAnswerModel
    {
        public int FieldID { get; set; }
        public string AnswerValue { get; set; }
    }
}