using FinalProject.BL.Services;
using FinalProject.DAL.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;

namespace FinalProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FormInstanceController : ControllerBase
    {
        private readonly FormInstanceService _instanceService;
        private readonly FormService _formService;
        private readonly PersonService _personService;
        private readonly DepartmentService _departmentService;

        public FormInstanceController(IConfiguration configuration)
        {
            _instanceService = new FormInstanceService(configuration);
            _formService = new FormService(configuration);
            _personService = new PersonService(configuration);
            _departmentService = new DepartmentService(configuration);
        }

        [HttpGet("form/{formId}")]
        public IActionResult GetInstancesByFormId(int formId)
        {
            try
            {
                var instances = _instanceService.GetInstancesByFormId(formId);
                return Ok(instances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }

        }


        [HttpGet("user/{userId}")]
        public IActionResult GetUserInstances(string userId)
        {
            try
            {
                var currentUserId = User.Identity?.Name;

                // בדיקת הרשאות
                if (!CanUserViewInstances(currentUserId, userId))
                    return Forbid("Not authorized to view these instances");

                var instances = _instanceService.GetUserInstances(userId);
                return Ok(instances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// יצירת מופע טופס חדש - כל המרצים
        /// </summary>
        [HttpPost("form/{formId}")]
        [Authorize(Roles = "מרצה,ראש התמחות,ראש מחלקה,דיקאן")]
        public IActionResult CreateInstance(int formId)
        {
            try
            {
                var currentUserId = User.Identity?.Name;

                var form = _formService.GetFormById(formId);
                if (form == null)
                    return NotFound($"Form with ID {formId} not found");

                if (!form.IsPublished || !form.IsActive)
                    return BadRequest("Cannot create instance for unpublished or inactive form");

                var instanceId = _instanceService.CreateInstance(currentUserId, formId);
                if (instanceId > 0)
                {
                    var instance = _instanceService.GetInstanceById(instanceId);
                    return CreatedAtAction(nameof(GetInstanceById), new { id = instanceId }, instance);
                }
                else
                {
                    return BadRequest("Failed to create instance");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// הגשת מופע טופס - רק בעל המופע
        /// </summary>
        [HttpPost("{id}/submit")]
        public IActionResult SubmitInstance(int id, [FromBody] SubmitInstanceModel model)
        {
            try
            {
                var instance = _instanceService.GetInstanceById(id);
                if (instance == null)
                    return NotFound($"Instance with ID {id} not found");

                var currentUserId = User.Identity?.Name;
                if (currentUserId != instance.UserID)
                    return Forbid("Can only submit your own instances");

                var comments = model?.Comments;
                var result = _instanceService.SubmitInstance(id, comments);
                if (result > 0)
                {
                    return Ok(new { Message = "Instance submitted successfully" });
                }
                else
                {
                    return BadRequest("Failed to submit instance");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת טפסים לבדיקה - לפי הרשאות
        /// </summary>
        [HttpGet("for-review")]
        [Authorize(Roles = "ראש מחלקה,ראש התמחות,דיקאן,מנהל סטודנטים")]
        public IActionResult GetInstancesForReview()
        {
            try
            {
                var currentUserId = User.Identity?.Name;
                var currentUser = _personService.GetPersonById(currentUserId);
                var userRoles = _personService.GetPersonRoles(currentUserId);

                List<dynamic> instances = new List<dynamic>();

                // מנהל סטודנטים רואה את כל הטפסים שעברו אישור דיקאן
                if (userRoles.Any(r => r.RoleName == "מנהל סטודנטים"))
                {
                    var allInstances = new List<FormInstance>();

                    // טפסים שהוגשו
                    var submittedInstances = _instanceService.GetInstancesByStage("Submitted");
                    if (submittedInstances != null) allInstances.AddRange(submittedInstances);

                    // טפסים שאושרו במחלקה
                    var deptApprovedInstances = _instanceService.GetInstancesByStage("ApprovedByDepartment");
                    if (deptApprovedInstances != null) allInstances.AddRange(deptApprovedInstances);

                    // טפסים שאושרו בדיקאן (ממתינים לאישור סופי)
                    var deanApprovedInstances = _instanceService.GetInstancesByStage("ApprovedByDean");
                    if (deanApprovedInstances != null) allInstances.AddRange(deanApprovedInstances);

                    // טפסים שאושרו סופית
                    var finalApprovedInstances = _instanceService.GetInstancesByStage("FinalApproved");
                    if (finalApprovedInstances != null) allInstances.AddRange(finalApprovedInstances);

                    // טפסים שאושרו (גרסה ישנה)
                    var approvedInstances = _instanceService.GetInstancesByStage("Approved");
                    if (approvedInstances != null) allInstances.AddRange(approvedInstances);

                    // טפסים שנדחו
                    var rejectedInstances = _instanceService.GetInstancesByStage("Rejected");
                    if (rejectedInstances != null) allInstances.AddRange(rejectedInstances);

                    // הסרת כפילויות
                    allInstances = allInstances
                        .GroupBy(i => i.InstanceId)
                        .Select(g => g.First())
                        .ToList();

                    // הוספת פרטי המשתמש לכל מופע
                    instances = allInstances.Select(instance => {
                        var user = _personService.GetPersonById(instance.UserID);
                        return new
                        {
                            instanceId = instance.InstanceId,
                            formId = instance.FormId,
                            userID = instance.UserID,
                            firstName = user?.FirstName ?? "",
                            lastName = user?.LastName ?? "",
                            fullName = user != null ? $"{user.FirstName} {user.LastName}" : "",
                            createdDate = instance.CreatedDate,
                            currentStage = instance.CurrentStage,
                            totalScore = instance.TotalScore,
                            submissionDate = instance.SubmissionDate,
                            lastModifiedDate = instance.LastModifiedDate,
                            comments = instance.Comments
                        };
                    }).ToList<dynamic>();

                    return Ok(instances);
                }

                // דיקאן רואה את הטפסים מהפקולטה שלו
                if (userRoles.Any(r => r.RoleName == "דיקאן"))
                {
                    if (!currentUser.DepartmentID.HasValue)
                        return Ok(new List<object>());

                    // קבלת הפקולטה של הדיקאן
                    var deanDepartment = _departmentService.GetDepartmentById(currentUser.DepartmentID.Value);
                    if (deanDepartment == null || !deanDepartment.FacultyId.HasValue)
                        return Ok(new List<object>());

                    var facultyId = deanDepartment.FacultyId.Value;
                    var facultyInstances = new List<FormInstance>();

                    // טפסים שממתינים לאישור הדיקאן
                    var pendingInstances = _instanceService.GetInstancesForDean(facultyId);
                    facultyInstances.AddRange(pendingInstances);

                    // טפסים שהדיקאן כבר אישר
                    var approvedByDean = _instanceService.GetInstancesByStage("ApprovedByDean")
                        .Where(i => {
                            var user = _personService.GetPersonById(i.UserID);
                            if (user?.DepartmentID == null) return false;
                            var dept = _departmentService.GetDepartmentById(user.DepartmentID.Value);
                            return dept?.FacultyId == facultyId;
                        }).ToList();
                    facultyInstances.AddRange(approvedByDean);

                    // טפסים שאושרו סופית מהפקולטה
                    var finalApproved = _instanceService.GetInstancesByStage("FinalApproved")
                        .Where(i => {
                            var user = _personService.GetPersonById(i.UserID);
                            if (user?.DepartmentID == null) return false;
                            var dept = _departmentService.GetDepartmentById(user.DepartmentID.Value);
                            return dept?.FacultyId == facultyId;
                        }).ToList();
                    facultyInstances.AddRange(finalApproved);

                    // טפסים שנדחו מהפקולטה
                    var rejected = _instanceService.GetInstancesByStage("Rejected")
                        .Where(i => {
                            var user = _personService.GetPersonById(i.UserID);
                            if (user?.DepartmentID == null) return false;
                            var dept = _departmentService.GetDepartmentById(user.DepartmentID.Value);
                            return dept?.FacultyId == facultyId;
                        }).ToList();
                    facultyInstances.AddRange(rejected);

                    // הסרת כפילויות
                    facultyInstances = facultyInstances
                        .GroupBy(i => i.InstanceId)
                        .Select(g => g.First())
                        .ToList();

                    instances = facultyInstances.Select(instance => {
                        var user = _personService.GetPersonById(instance.UserID);
                        return new
                        {
                            instanceId = instance.InstanceId,
                            formId = instance.FormId,
                            userID = instance.UserID,
                            firstName = user?.FirstName ?? "",
                            lastName = user?.LastName ?? "",
                            fullName = user != null ? $"{user.FirstName} {user.LastName}" : "",
                            createdDate = instance.CreatedDate,
                            currentStage = instance.CurrentStage,
                            totalScore = instance.TotalScore,
                            submissionDate = instance.SubmissionDate,
                            lastModifiedDate = instance.LastModifiedDate,
                            comments = instance.Comments
                        };
                    }).ToList<dynamic>();

                    return Ok(instances);
                }

                // ראש מחלקה/התמחות רואה את הטפסים מהמחלקה שלו
                if (userRoles.Any(r => r.RoleName == "ראש מחלקה" || r.RoleName == "ראש התמחות"))
                {
                    if (!currentUser.DepartmentID.HasValue)
                        return Ok(new List<object>());

                    // קבלת כל הטפסים מהמחלקה - גם כאלה שכבר אושרו
                    var departmentInstances = new List<FormInstance>();

                    // טפסים שממתינים לאישור
                    var pendingInstances = _instanceService.GetInstancesForDepartmentHead(currentUser.DepartmentID.Value);
                    departmentInstances.AddRange(pendingInstances);

                    // טפסים שכבר אושרו על ידי ראש המחלקה
                    var approvedByDept = _instanceService.GetInstancesByStage("ApprovedByDepartment")
                        .Where(i => {
                            var user = _personService.GetPersonById(i.UserID);
                            return user?.DepartmentID == currentUser.DepartmentID;
                        }).ToList();
                    departmentInstances.AddRange(approvedByDept);

                    // טפסים שאושרו על ידי הדיקאן
                    var approvedByDean = _instanceService.GetInstancesByStage("ApprovedByDean")
                        .Where(i => {
                            var user = _personService.GetPersonById(i.UserID);
                            return user?.DepartmentID == currentUser.DepartmentID;
                        }).ToList();
                    departmentInstances.AddRange(approvedByDean);

                    // טפסים שאושרו סופית
                    var finalApproved = _instanceService.GetInstancesByStage("FinalApproved")
                        .Where(i => {
                            var user = _personService.GetPersonById(i.UserID);
                            return user?.DepartmentID == currentUser.DepartmentID;
                        }).ToList();
                    departmentInstances.AddRange(finalApproved);

                    // טפסים שנדחו
                    var rejected = _instanceService.GetInstancesByStage("Rejected")
                        .Where(i => {
                            var user = _personService.GetPersonById(i.UserID);
                            return user?.DepartmentID == currentUser.DepartmentID;
                        }).ToList();
                    departmentInstances.AddRange(rejected);

                    // הסרת כפילויות
                    departmentInstances = departmentInstances
                        .GroupBy(i => i.InstanceId)
                        .Select(g => g.First())
                        .ToList();

                    instances = departmentInstances.Select(instance => {
                        var user = _personService.GetPersonById(instance.UserID);
                        return new
                        {
                            instanceId = instance.InstanceId,
                            formId = instance.FormId,
                            userID = instance.UserID,
                            firstName = user?.FirstName ?? "",
                            lastName = user?.LastName ?? "",
                            fullName = user != null ? $"{user.FirstName} {user.LastName}" : "",
                            createdDate = instance.CreatedDate,
                            currentStage = instance.CurrentStage,
                            totalScore = instance.TotalScore,
                            submissionDate = instance.SubmissionDate,
                            lastModifiedDate = instance.LastModifiedDate,
                            comments = instance.Comments
                        };
                    }).ToList<dynamic>();

                    return Ok(instances);
                }

                return Forbid("Not authorized to review instances");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// אישור מופע טופס - לפי הרשאות בהיררכיה
        /// </summary>
        [HttpPost("{id}/approve")]
        [Authorize(Roles = "ראש מחלקה,ראש התמחות,דיקאן,מנהל סטודנטים")]
        public IActionResult ApproveInstance(int id, [FromBody] ApproveInstanceModel model)
        {
            try
            {
                var instance = _instanceService.GetInstanceById(id);
                if (instance == null)
                    return NotFound($"Instance with ID {id} not found");

                var currentUserId = User.Identity?.Name;

                // בדיקת הרשאות לאישור
                if (!CanUserApproveInstance(currentUserId, instance))
                    return Forbid("Not authorized to approve this instance");

                // קביעת הסטטוס החדש לפי התפקיד
                string newStatus = GetNextApprovalStatus(currentUserId);

                // עדכון הסטטוס באמצעות המתודה הקיימת בשירות
                var result = _instanceService.UpdateInstanceStatus(id, newStatus, model?.Comments);
                if (result > 0)
                {
                    return Ok(new
                    {
                        Message = "Instance approved successfully",
                        NewStatus = newStatus
                    });
                }
                else
                {
                    return BadRequest("Failed to approve instance");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// דחיית מופע טופס - לפי הרשאות
        /// </summary>
        [HttpPost("{id}/reject")]
        [Authorize(Roles = "ראש מחלקה,ראש התמחות,דיקאן,מנהל סטודנטים")]
        public IActionResult RejectInstance(int id, [FromBody] RejectInstanceModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Comments))
                    return BadRequest("Comments are required for rejection");

                var instance = _instanceService.GetInstanceById(id);
                if (instance == null)
                    return NotFound($"Instance with ID {id} not found");

                var currentUserId = User.Identity?.Name;

                if (!CanUserApproveInstance(currentUserId, instance))
                    return Forbid("Not authorized to reject this instance");

                // השתמש במתודה הקיימת בשירות
                var result = _instanceService.RejectInstance(id, model.Comments);
                if (result > 0)
                {
                    return Ok(new { Message = "Instance rejected successfully" });
                }
                else
                {
                    return BadRequest("Failed to reject instance");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }




        [HttpGet("{id}")]
        public IActionResult GetInstanceById(int id)
        {
            try
            {
                var instance = _instanceService.GetInstanceById(id);
                if (instance == null)
                    return NotFound($"Instance with ID {id} not found");

                var currentUserId = User.Identity?.Name;

                // בדיקת הרשאות לצפייה
                if (!CanUserViewInstance(currentUserId, instance))
                    return Forbid("Not authorized to view this instance");

                return Ok(instance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        // Helper Methods
        private bool CanUserApproveInstance(string userId, FormInstance instance)
        {
            var user = _personService.GetPersonById(userId);
            var userRoles = _personService.GetPersonRoles(userId);

            // מנהל סטודנטים יכול לאשר רק טפסים שעברו דיקאן
            if (userRoles.Any(r => r.RoleName == "מנהל סטודנטים"))
            {
                return instance.CurrentStage == "ApprovedByDean";
            }

            // דיקאן יכול לאשר רק טפסים מהפקולטה שלו שאושרו במחלקה
            if (userRoles.Any(r => r.RoleName == "דיקאן"))
            {
                if (instance.CurrentStage != "ApprovedByDepartment")
                    return false;

                // בדיקה שהמשתמש מאותה פקולטה
                var instanceUser = _personService.GetPersonById(instance.UserID);
                if (instanceUser?.DepartmentID == null || user?.DepartmentID == null)
                    return false;

                var userDept = _departmentService.GetDepartmentById(user.DepartmentID.Value);
                var instanceDept = _departmentService.GetDepartmentById(instanceUser.DepartmentID.Value);

                return userDept?.FacultyId == instanceDept?.FacultyId;
            }

            // ראש מחלקה/התמחות יכול לאשר רק טפסים מהמחלקה שלו שהוגשו
            if (userRoles.Any(r => r.RoleName == "ראש מחלקה" || r.RoleName == "ראש התמחות"))
            {
                if (instance.CurrentStage != "Submitted")
                    return false;

                // בדיקה שהמשתמש מאותה מחלקה
                var instanceUser = _personService.GetPersonById(instance.UserID);
                return instanceUser?.DepartmentID == user?.DepartmentID;
            }

            return false;
        }

        private string GetNextApprovalStatus(string userId)
        {
            var userRoles = _personService.GetPersonRoles(userId);

            if (userRoles.Any(r => r.RoleName == "מנהל סטודנטים"))
                return "FinalApproved";

            if (userRoles.Any(r => r.RoleName == "דיקאן"))
                return "ApprovedByDean";

            if (userRoles.Any(r => r.RoleName == "ראש מחלקה" || r.RoleName == "ראש התמחות"))
                return "ApprovedByDepartment";

            return "UnderReview";
        }


        /// <summary>
        /// עדכון סטטוס מופע
        /// </summary>
        private int UpdateInstanceStatus(int instanceId, string newStatus, string comments = null)
        {
            var instance = _instanceService.GetInstanceById(instanceId);
            if (instance == null)
                return 0;

            instance.CurrentStage = newStatus;
            instance.LastModifiedDate = DateTime.Now;

            if (!string.IsNullOrEmpty(comments))
            {
                instance.Comments = comments;
            }

            return _instanceService.UpdateInstanceStatus(instanceId , newStatus, comments);
        }
        private bool CanUserViewInstances(string currentUserId, string targetUserId)
        {
            if (currentUserId == targetUserId) return true;

            var userRoles = _personService.GetPersonRoles(currentUserId);

            // מנהל סטודנטים רואה הכל
            if (userRoles.Any(r => r.RoleName == "מנהל סטודנטים"))
                return true;

            // דיקאן ראש מחלקה רואים את התחום שלהם
            if (userRoles.Any(r => r.RoleName == "דיקאן" || r.RoleName == "ראש מחלקה"))
            {
                var currentUser = _personService.GetPersonById(currentUserId);
                var targetUser = _personService.GetPersonById(targetUserId);

                if (userRoles.Any(r => r.RoleName == "דיקאן"))
                {
                    // דיקאן רואה את כל הפקולטה
                    var currentDepartment = _departmentService.GetDepartmentById(currentUser.DepartmentID.Value);
                    var targetDepartment = _departmentService.GetDepartmentById(targetUser.DepartmentID.Value);
                    return currentDepartment.FacultyId == targetDepartment.FacultyId;
                }

                if (userRoles.Any(r => r.RoleName == "ראש מחלקה"))
                {
                    // ראש מחלקה רואה רק את המחלקה שלו
                    return currentUser.DepartmentID == targetUser.DepartmentID;
                }
            }

            return false;
        }

        
        private bool CanUserViewInstance(string currentUserId, FormInstance instance)
        {
            return CanUserViewInstances(currentUserId, instance.UserID);
        }

  
        private List<FormInstance> GetInstancesByDepartment(int departmentId, string status)
        {
            // צריך להוסיף מתודה זו ל-FormInstanceService
            return _instanceService.GetInstancesByStage(status)
                .Where(i => {
                    var user = _personService.GetPersonById(i.UserID);
                    return user.DepartmentID == departmentId;
                }).ToList();
        }

        private List<FormInstance> GetInstancesByFaculty(int facultyId, string status)
        {
            // צריך להוסיף מתודה זו ל-FormInstanceService
            return _instanceService.GetInstancesByStage(status)
                .Where(i => {
                    var user = _personService.GetPersonById(i.UserID);
                    var department = _departmentService.GetDepartmentById(user.DepartmentID.Value);
                    return department.FacultyId == facultyId;
                }).ToList();
        }
    }

    // Request Models
    public class SubmitInstanceModel
    {
        public string Comments { get; set; }
    }

    public class ApproveInstanceModel
    {
        public string Comments { get; set; }
    }

    public class RejectInstanceModel
    {
        public string Comments { get; set; }
    }
}