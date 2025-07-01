//AppealService.cs
using FinalProject.DAL.Models;
using FinalProject.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FinalProject.BL.Services
{
    public class AppealService
    {
        private readonly AppealRepository _appealRepository;
        private readonly FormInstanceRepository _instanceRepository;
        private readonly PersonRepository _personRepository;

        public AppealService(IConfiguration configuration)
        {
            _appealRepository = new AppealRepository(configuration);
            _instanceRepository = new FormInstanceRepository(configuration);
            _personRepository = new PersonRepository(configuration);
        }

        public int CreateAppeal(int instanceId, string appealReason, string userId)
        {
            if (instanceId <= 0)
                throw new ArgumentException("Instance ID must be greater than zero");

            if (string.IsNullOrEmpty(appealReason))
                throw new ArgumentException("Appeal reason is required");

            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID is required");

            // בדיקה שהמופע קיים ושייך למשתמש
            var instance = _instanceRepository.GetInstanceById(instanceId);
            if (instance == null)
                throw new ArgumentException($"Instance with ID {instanceId} does not exist");

            if (instance.UserID != userId)
                throw new UnauthorizedAccessException("User can only appeal their own instances");

            // בדיקה שהמופע בסטטוס מתאים לערעור
            if (instance.CurrentStage != "Rejected" && instance.CurrentStage != "FinalApproved")
                throw new InvalidOperationException("Can only appeal rejected or final approved instances");

            // בדיקה שאין כבר ערעור פתוח
            var existingAppeals = _appealRepository.GetAppealsByInstanceId(instanceId);
            if (existingAppeals.Any(a => a.AppealStatus == "Pending"))
                throw new InvalidOperationException("Instance already has a pending appeal");

            // יצירת הערעור
            var appeal = new Appeal
            {
                InstanceId = instanceId,
                AppealReason = appealReason,
                AppealDate = DateTime.Now,
                AppealStatus = "Pending"
            };

            return _appealRepository.CreateAppeal(appeal);
        }

        public List<Appeal> GetPendingAppeals()
        {
            return _appealRepository.GetPendingAppeals();
        }

        public List<Appeal> GetPendingAppealsForUser(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID is required");

            // רק מנהל סטודנטים יכול לראות ערעורים
            var person = _personRepository.GetPersonById(userId);
            var roles = _personRepository.GetPersonRoles(userId);

            if (!roles.Any(r => r.RoleName == "מנהל סטודנטים"))
                throw new UnauthorizedAccessException("Only student manager can view appeals");

            return _appealRepository.GetPendingAppeals();
        }

        public int RespondToAppeal(int appealId, bool isApproved, string reviewerResponse, string reviewedBy)
        {
            if (appealId <= 0)
                throw new ArgumentException("Appeal ID must be greater than zero");

            if (string.IsNullOrEmpty(reviewerResponse))
                throw new ArgumentException("Reviewer response is required");

            if (string.IsNullOrEmpty(reviewedBy))
                throw new ArgumentException("Reviewed by is required");

            // בדיקה שהערעור קיים
            var appeal = _appealRepository.GetAppealById(appealId);
            if (appeal == null)
                throw new ArgumentException($"Appeal with ID {appealId} does not exist");

            if (appeal.AppealStatus != "Pending")
                throw new InvalidOperationException("Can only respond to pending appeals");

            // בדיקה שהמשתמש מורשה לענות על ערעורים (רק מנהל סטודנטים)
            var reviewerRoles = _personRepository.GetPersonRoles(reviewedBy);
            if (!reviewerRoles.Any(r => r.RoleName == "מנהל סטודנטים"))
                throw new UnauthorizedAccessException("Only student manager can respond to appeals");

            string appealStatus = isApproved ? "Approved" : "Rejected";
            return _appealRepository.RespondToAppeal(appealId, appealStatus, reviewerResponse, reviewedBy);
        }

        public Appeal GetAppealById(int appealId)
        {
            if (appealId <= 0)
                throw new ArgumentException("Appeal ID must be greater than zero");

            return _appealRepository.GetAppealById(appealId);
        }

        public List<Appeal> GetAppealsByInstanceId(int instanceId)
        {
            if (instanceId <= 0)
                throw new ArgumentException("Instance ID must be greater than zero");

            return _appealRepository.GetAppealsByInstanceId(instanceId);
        }

        public bool CanUserAppeal(int instanceId, string userId)
        {
            if (instanceId <= 0 || string.IsNullOrEmpty(userId))
                return false;

            try
            {
                var instance = _instanceRepository.GetInstanceById(instanceId);
                if (instance == null || instance.UserID != userId)
                    return false;

                // יכול לערער רק על מופעים שנדחו או אושרו סופית
                if (instance.CurrentStage != "Rejected" && instance.CurrentStage != "FinalApproved")
                    return false;

                // בדיקה שאין ערעור פתוח
                var existingAppeals = _appealRepository.GetAppealsByInstanceId(instanceId);
                return !existingAppeals.Any(a => a.AppealStatus == "Pending");
            }
            catch
            {
                return false;
            }
        }
    }
}