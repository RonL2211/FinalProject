//FormInstanceService.cs - מתוקן עם תמיכה בסטטוסים החדשים
using FinalProject.DAL.Models;
using FinalProject.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FinalProject.BL.Services
{
    public class FormInstanceService
    {
        private readonly FormInstanceRepository _instanceRepository;
        private readonly FormRepository _formRepository;
        private readonly PersonRepository _personRepository;

        public FormInstanceService(IConfiguration configuration)
        {
            _instanceRepository = new FormInstanceRepository(configuration);
            _formRepository = new FormRepository(configuration);
            _personRepository = new PersonRepository(configuration);
        }

        public List<FormInstance> GetUserInstances(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty");

            return _instanceRepository.GetInstancesByUserId(userId);
        }

        public FormInstance GetInstanceById(int instanceId)
        {
            if (instanceId <= 0)
                throw new ArgumentException("Instance ID must be greater than zero");

            return _instanceRepository.GetInstanceById(instanceId);
        }

        public int CreateInstance(string userId, int formId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty");

            if (formId <= 0)
                throw new ArgumentException("Form ID must be greater than zero");

            // בדיקה שהטופס קיים ופעיל
            var form = _formRepository.GetFormById(formId);
            if (form == null)
                throw new ArgumentException($"Form with ID {formId} does not exist");

            if (!form.IsActive || !form.IsPublished)
                throw new InvalidOperationException("Cannot create an instance for an inactive or unpublished form");

            // בדיקה שהמשתמש קיים
            var person = _personRepository.GetPersonById(userId);
            if (person == null)
                throw new ArgumentException($"User with ID {userId} does not exist");

            // בדיקה שלא קיים כבר מופע פעיל של טופס זה למשתמש זה
            var existingInstances = _instanceRepository.GetInstancesByUserId(userId)
                .Where(i => i.FormId == formId &&
                           i.CurrentStage != "Rejected" &&
                           i.CurrentStage != "AppealRejected" &&
                           i.CurrentStage != "FinalApproved" &&
                           i.CurrentStage != "AppealApproved")
                .ToList();

            if (existingInstances.Any())
                throw new InvalidOperationException("User already has an active instance of this form");

            // יצירת מופע הטופס עם סטטוס טיוטה
            var instance = new FormInstance
            {
                FormId = formId,
                UserID = userId,
                CreatedDate = DateTime.Now,
                CurrentStage = "Draft",
                TotalScore = 0,
                LastModifiedDate = DateTime.Now
            };

            return _instanceRepository.CreateInstance(instance);
        }

        public int SubmitInstance(int instanceId, string comments = null)
        {
            if (instanceId <= 0)
                throw new ArgumentException("Instance ID must be greater than zero");

            var instance = _instanceRepository.GetInstanceById(instanceId);
            if (instance == null)
                throw new ArgumentException($"Instance with ID {instanceId} does not exist");

            // בדיקה שהמופע במצב טיוטה או הוחזר לתיקון
            if (instance.CurrentStage != "Draft" && instance.CurrentStage != "Returned")
                throw new InvalidOperationException("Can only submit instances in Draft or Returned status");

            // עדכון סטטוס המופע ל-'הוגש לראש מחלקה'
            return _instanceRepository.UpdateInstanceStatus(instanceId, "Submitted", comments);
        }

        public int ApproveInstanceByDepartment(int instanceId, string comments = null)
        {
            return UpdateInstanceStatusWithValidation(instanceId, "Submitted", "ApprovedByDepartment", comments);
        }

        public int ApproveInstanceByDean(int instanceId, string comments = null)
        {
            return UpdateInstanceStatusWithValidation(instanceId, "ApprovedByDepartment", "ApprovedByDean", comments);
        }

        public int FinalApproveInstance(int instanceId, decimal? totalScore = null, string comments = null)
        {
            var result = UpdateInstanceStatusWithValidation(instanceId, "ApprovedByDean", "FinalApproved", comments);

            // עדכון ציון אם סופק
            if (totalScore.HasValue && result > 0)
            {
                _instanceRepository.SubmitInstance(instanceId, totalScore.Value);
            }

            return result;
        }

        public int RejectInstance(int instanceId, string comments)
        {
            if (string.IsNullOrEmpty(comments))
                throw new ArgumentException("Comments are required for rejection");

            var instance = _instanceRepository.GetInstanceById(instanceId);
            if (instance == null)
                throw new ArgumentException($"Instance with ID {instanceId} does not exist");

            // ניתן לדחות מופעים בכל שלב של הבדיקה
            var allowedStatuses = new[] { "Submitted", "ApprovedByDepartment", "ApprovedByDean", "UnderAppeal" };
            if (!allowedStatuses.Contains(instance.CurrentStage))
                throw new InvalidOperationException($"Cannot reject instance in status {instance.CurrentStage}");

            return _instanceRepository.UpdateInstanceStatus(instanceId, "Rejected", comments);
        }

        public int ReturnForRevision(int instanceId, string comments)
        {
            if (string.IsNullOrEmpty(comments))
                throw new ArgumentException("Comments are required for return");

            var instance = _instanceRepository.GetInstanceById(instanceId);
            if (instance == null)
                throw new ArgumentException($"Instance with ID {instanceId} does not exist");

            // ניתן להחזיר לתיקון מופעים בשלבי בדיקה
            var allowedStatuses = new[] { "Submitted", "ApprovedByDepartment", "ApprovedByDean" };
            if (!allowedStatuses.Contains(instance.CurrentStage))
                throw new InvalidOperationException($"Cannot return instance in status {instance.CurrentStage}");

            return _instanceRepository.UpdateInstanceStatus(instanceId, "Returned", comments);
        }

        public int UpdateInstanceStatus(FormInstance instance , string newStatus)
        {
            if (instance.InstanceId <= 0)
                throw new ArgumentException("Instance ID must be greater than zero");

            if (string.IsNullOrEmpty(newStatus))
                throw new ArgumentException("New status cannot be empty");

            // רשימת סטטוסים תקינים
            var validStatuses = new[]
            {
                "Draft", "Submitted", "ApprovedByDepartment", "ApprovedByDean",
                "FinalApproved", "Rejected", "UnderAppeal", "AppealApproved",
                "AppealRejected", "Returned"
            };

            if (!validStatuses.Contains(newStatus))
                throw new ArgumentException($"Invalid status: {newStatus}");

            return _instanceRepository.UpdateInstanceStatus(instance.InstanceId, newStatus, instance.Comments);
        }

        public List<FormInstance> GetInstancesByStage(string stage)
        {
            if (string.IsNullOrEmpty(stage))
                throw new ArgumentException("Stage cannot be empty");

            return _instanceRepository.GetInstancesByStage(stage);
        }

        public List<FormInstance> GetInstancesByFormId(int formId)
        {
            if (formId <= 0)
                throw new ArgumentException("Form ID must be greater than zero");

            return _instanceRepository.GetInstancesByFormId(formId);
        }

        public Dictionary<string, int> GetInstancesStatisticsByForm(int formId)
        {
            if (formId <= 0)
                throw new ArgumentException("Form ID must be greater than zero");

            var instances = _instanceRepository.GetInstancesByFormId(formId);
            var stats = new Dictionary<string, int>();

            // חישוב סטטיסטיקות לפי סטטוס
            var stages = instances.Select(i => i.CurrentStage).Distinct().ToList();
            foreach (var stage in stages)
            {
                stats.Add(stage, instances.Count(i => i.CurrentStage == stage));
            }

            // הוספת סך הכל
            stats.Add("Total", instances.Count);

            return stats;
        }

        public List<FormInstance> GetInstancesForDepartmentHead(int departmentId)
        {
            if (departmentId <= 0)
                throw new ArgumentException("Department ID must be greater than zero");

            return _instanceRepository.GetInstancesByStage("Submitted")
                .Where(i => {
                    var user = _personRepository.GetPersonById(i.UserID);
                    return user?.DepartmentID == departmentId;
                }).ToList();
        }

        public List<FormInstance> GetInstancesForDean(int facultyId)
        {
            if (facultyId <= 0)
                throw new ArgumentException("Faculty ID must be greater than zero");

            return _instanceRepository.GetInstancesByStage("ApprovedByDepartment")
                .Where(i => {
                    var user = _personRepository.GetPersonById(i.UserID);
                    if (user?.DepartmentID == null) return false;

                    // כאן צריך לקבל את הפקולטה של המחלקה - צריך DepartmentService
                    // נניח שיש לנו גישה אליו או נשתמש בשאילתה ישירה
                    return true; // זמני - יש לממש בצורה נכונה
                }).ToList();
        }

        public bool CanInstanceBeEdited(int instanceId, string userId)
        {
            var instance = GetInstanceById(instanceId);
            if (instance == null || instance.UserID != userId)
                return false;

            // ניתן לערוך רק טיוטות או מופעים שהוחזרו לתיקון
            return instance.CurrentStage == "Draft" || instance.CurrentStage == "Returned";
        }

        public bool CanInstanceBeSubmitted(int instanceId, string userId)
        {
            var instance = GetInstanceById(instanceId);
            if (instance == null || instance.UserID != userId)
                return false;

            return instance.CurrentStage == "Draft" || instance.CurrentStage == "Returned";
        }

        // Helper method for status validation
        private int UpdateInstanceStatusWithValidation(int instanceId, string expectedCurrentStatus, string newStatus, string comments)
        {
            var instance = _instanceRepository.GetInstanceById(instanceId);
            if (instance == null)
                throw new ArgumentException($"Instance with ID {instanceId} does not exist");

            if (instance.CurrentStage != expectedCurrentStatus)
                throw new InvalidOperationException($"Instance must be in {expectedCurrentStatus} status to move to {newStatus}");

            return _instanceRepository.UpdateInstanceStatus(instanceId, newStatus, comments);
        }
    }
}