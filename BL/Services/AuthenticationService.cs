using FinalProject.DAL.Models;
using FinalProject.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using System;

namespace FinalProject.BL.Services
{
    public class AuthenticationService
    {
        private readonly PersonRepository _personRepository;
        private readonly RoleService _roleService;

        public AuthenticationService(IConfiguration configuration)
        {
            _personRepository = new PersonRepository(configuration);
            _roleService = new RoleService(configuration);
        }

        public Person Authenticate(string personId, string password)
        {
            if (string.IsNullOrEmpty(personId) || string.IsNullOrEmpty(password))
                return null;

            var person = _personRepository.GetPersonById(personId);
            if (person == null)
                return null;

            // השוואה בטקסט פתוח – אין hashing
            if (person.Password != password)
                return null;

            // לא להחזיר את הסיסמה למשתמש
            person.Password = null;
            return person;
        }

        public bool IsAuthorizedForEntity(string personId, int entityId, string requiredRole)
        {
            if (string.IsNullOrEmpty(personId) || entityId <= 0 || string.IsNullOrEmpty(requiredRole))
                return false;

            if (_roleService.IsAdmin(personId))
                return true;

            return false;
        }

        public bool CanAccessForm(string personId, int formId)
        {
            if (string.IsNullOrEmpty(personId) || formId <= 0)
                return false;

            if (_roleService.IsAdmin(personId) || _roleService.IsCommitteeMember(personId))
                return true;

            return false;
        }

        public bool CanManageUsers(string personId)
        {
            return !string.IsNullOrEmpty(personId) && _roleService.IsAdmin(personId);
        }
    }
}



