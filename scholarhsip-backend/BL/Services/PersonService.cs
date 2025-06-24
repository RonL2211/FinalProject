using FinalProject.DAL.Models;
using FinalProject.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FinalProject.BL.Services
{
    public class PersonService
    {
        private readonly PersonRepository _personRepository;

        public PersonService(IConfiguration configuration)
        {
            _personRepository = new PersonRepository(configuration);
        }

        public List<Person> GetAllPersons() => _personRepository.GetAllPersons();

        public Person GetPersonById(string personId)
        {
            if (string.IsNullOrEmpty(personId))
                throw new ArgumentException("Person ID cannot be empty");
            return _personRepository.GetPersonById(personId);
        }

        public Person GetPersonByUsername(string username)
        {
            if (string.IsNullOrEmpty(username))
                throw new ArgumentException("Username cannot be empty");
            return _personRepository.GetPersonByUsername(username);
        }

        public bool AuthenticateUser(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                return false;
            var person = _personRepository.GetPersonByUsername(username);
            if (person == null)
                return false;
            return person.Password == password;
        }

        public int AddPerson(Person person)
        {
            ValidatePerson(person);
            return _personRepository.AddPerson(person);
        }

        public int UpdatePerson(Person person)
        {
            ValidatePerson(person);

            if (string.IsNullOrEmpty(person.Password))
            {
                var existingPerson = _personRepository.GetPersonById(person.PersonId);
                person.Password = existingPerson.Password;
            }
            return _personRepository.UpdatePerson(person);
        }

        private void ValidatePerson(Person person)
        {
            if (person == null)
                throw new ArgumentNullException(nameof(person), "Person cannot be null");

            if (string.IsNullOrEmpty(person.PersonId))
                throw new ArgumentException("Person ID is required");

            // אם אינך משתמש בשדה Username – ניתן להסיר בדיקה זו:
            // if (string.IsNullOrEmpty(person.Username))
            //     throw new ArgumentException("Username is required");

            if (string.IsNullOrEmpty(person.FirstName))
                throw new ArgumentException("First name is required");

            if (string.IsNullOrEmpty(person.LastName))
                throw new ArgumentException("Last name is required");

            if (string.IsNullOrEmpty(person.Email))
                throw new ArgumentException("Email is required");
        }

        public List<Role> GetPersonRoles(string personId)
        {
            if (string.IsNullOrEmpty(personId))
                throw new ArgumentException("Person ID cannot be empty");
            return _personRepository.GetPersonRoles(personId);
        }

        public bool IsPersonInRole(string personId, string roleName)
        {
            if (string.IsNullOrEmpty(personId) || string.IsNullOrEmpty(roleName))
                return false;
            var roles = _personRepository.GetPersonRoles(personId);
            return roles.Any(r => r.RoleName.Equals(roleName, StringComparison.OrdinalIgnoreCase));
        }

        public int AssignRoleToPerson(string personId, int roleId)
        {
            if (string.IsNullOrEmpty(personId))
                throw new ArgumentException("Person ID cannot be empty");
            return _personRepository.AssignRoleToPerson(personId, roleId);
        }

        public int RemoveRoleFromPerson(string personId, int roleId)
        {
            if (string.IsNullOrEmpty(personId))
                throw new ArgumentException("Person ID cannot be empty");
            return _personRepository.RemoveRoleFromPerson(personId, roleId);
        }
    }
}



