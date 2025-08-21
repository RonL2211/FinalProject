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
        [Authorize(Roles = "ראש מחלקה,דיקאן,מנהל סטודנטים")]
        public IActionResult GetInstancesForReview()
        {
            try
            {
                var currentUserId = User.Identity?.Name;
                var currentUser = _personService.GetPersonById(currentUserId);
                var userRoles = _personService.GetPersonRoles(currentUserId);

                // מנהל סטודנטים רואה הכל שעבר דיקאן
                if (userRoles.Any(r => r.RoleName == "מנהל סטודנטים"))
                {
                    var allInstances = _instanceService.GetAllInstances()
                        .Where(i => i.CurrentStage == "ApprovedByDean")
                        .ToList();

                    // הוספת פרטי המשתמש לכל מופע
                    foreach (var instance in allInstances)
                    {
                        var user = _personService.GetPersonById(instance.UserID);
                        if (user != null)
                        {
                            instance.FirstName = user.FirstName;
                            instance.LastName = user.LastName;
                            instance.FullName = $"{user.FirstName} {user.LastName}";
                        }
                    }

                    return Ok(allInstances);
                }

                // דיקאן רואה את הפקולטה שלו - דרך המחלקה
                if (userRoles.Any(r => r.RoleName == "דיקאן"))
                {
                    if (!currentUser.DepartmentID.HasValue)
                        return Ok(new List<FormInstance>());

                    // קבלת הפקולטה דרך המחלקה
                    var department = _departmentService.GetDepartmentById(currentUser.DepartmentID.Value);
                    if (department == null || !department.FacultyId.HasValue)
                        return Ok(new List<FormInstance>());

                    // קבלת כל המחלקות באותה פקולטה
                    var facultyDepartments = _departmentService.GetAllDepartments()
                        .Where(d => d.FacultyId == department.FacultyId.Value)
                        .Select(d => d.DepartmentID)
                        .ToList();

                    // קבלת כל המופעים מהמחלקות בפקולטה
                    var facultyInstances = _instanceService.GetAllInstances()
                        .Where(i => i.CurrentStage == "ApprovedByDepartment")
                        .ToList();

                    // סינון לפי המחלקות בפקולטה
                    var filteredInstances = new List<FormInstance>();
                    foreach (var instance in facultyInstances)
                    {
                        var instanceUser = _personService.GetPersonById(instance.UserID);
                        if (instanceUser != null && instanceUser.DepartmentID.HasValue &&
                            facultyDepartments.Contains(instanceUser.DepartmentID.Value))
                        {
                            instance.FirstName = instanceUser.FirstName;
                            instance.LastName = instanceUser.LastName;
                            instance.FullName = $"{instanceUser.FirstName} {instanceUser.LastName}";
                            filteredInstances.Add(instance);
                        }
                    }

                    return Ok(filteredInstances);
                }

                // ראש מחלקה רואה את המחלקה שלו
                if (userRoles.Any(r => r.RoleName == "ראש מחלקה" || r.RoleName == "ראש התמחות"))
                {
                    if (!currentUser.DepartmentID.HasValue)
                        return Ok(new List<FormInstance>());

                    // קבלת כל המופעים שהוגשו
                    var departmentInstances = _instanceService.GetAllInstances()
                        .Where(i => i.CurrentStage == "Submitted")
                        .ToList();

                    // סינון לפי המחלקה
                    var filteredInstances = new List<FormInstance>();
                    foreach (var instance in departmentInstances)
                    {
                        var instanceUser = _personService.GetPersonById(instance.UserID);
                        if (instanceUser != null && instanceUser.DepartmentID == currentUser.DepartmentID)
                        {
                            instance.FirstName = instanceUser.FirstName;
                            instance.LastName = instanceUser.LastName;
                            instance.FullName = $"{instanceUser.FirstName} {instanceUser.LastName}";
                            filteredInstances.Add(instance);
                        }
                    }

                    return Ok(filteredInstances);
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
        [Authorize(Roles = "ראש מחלקה,דיקאן,מנהל סטודנטים")]
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

                var result = UpdateInstanceStatus(id, newStatus, model?.Comments);
                if (result > 0)
                {
                    return Ok(new { Message = "Instance approved successfully", NewStatus = newStatus });
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
        [Authorize(Roles = "ראש מחלקה,דיקאן,מנהל סטודנטים")]
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
        /// <summary>
        /// פונקציה עזר לקביעת הסטטוס הבא
        /// </summary>
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
        /// בדיקת הרשאה לאישור
        /// </summary>
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

            // ראש מחלקה יכול לאשר רק טפסים מהמחלקה שלו שהוגשו
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

            return _instanceService.UpdateInstanceStatus(instance , newStatus);
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