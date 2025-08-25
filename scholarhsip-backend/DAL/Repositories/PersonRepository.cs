using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FinalProject.DAL.Repositories
{
    public class PersonRepository : DBServices
    {
        public PersonRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public List<Person> GetAllPersons()
        {
            List<Person> personList = new List<Person>();
            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAllPersons", null);

                foreach (DataRow row in dataTable.Rows)
                {
                    Person person = new Person
                    {
                        PersonId = row["PersonId"].ToString(),
                        FirstName = row["firstName"].ToString(),
                        LastName = row["lastName"].ToString(),
                        Email = row["email"].ToString(),
                        DepartmentID = row["DepartmentID"] != DBNull.Value ? Convert.ToInt32(row["DepartmentID"]) : null,
                        FolderPath = row["folderPath"].ToString(),
                        Username = row["Username"].ToString(),
                        Password = row["password"].ToString(),
                        Position = row["Position"].ToString(),
                        IsActive = Convert.ToBoolean(row["IsActive"]),
                        CreatedDate = row["CreatedDate"] != DBNull.Value ? Convert.ToDateTime(row["CreatedDate"]) : null
                    };
                    personList.Add(person);
                }

                return personList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Person GetPersonById(string personId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PersonId", personId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetPersonById", paramDic);
                Person person = null;
                DataRow row = dataTable.Rows[0];
                if (dataTable.Rows.Count > 0)
                {
                    person = new Person
                    {
                        PersonId = row["PersonId"].ToString(),
                        FirstName = row["firstName"].ToString(),
                        LastName = row["lastName"].ToString(),
                        Email = row["email"].ToString(),
                        DepartmentID = row["DepartmentID"] != DBNull.Value ? Convert.ToInt32(row["DepartmentID"]) : null,
                        FolderPath = row["folderPath"].ToString(),
                        Username = row["Username"].ToString(),
                        Password = row["password"].ToString(),
                        Position = row["Position"].ToString(),
                        IsActive = Convert.ToBoolean(row["IsActive"]),
                        CreatedDate = row["CreatedDate"] != DBNull.Value ? Convert.ToDateTime(row["CreatedDate"]) : null
                    };
                }

                return person;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Person GetPersonByUsername(string username)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@Username", username }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetPersonByUsername", paramDic);
                Person person = null;
            DataRow row = dataTable.Rows[0];
                if (dataTable.Rows.Count > 0)
                {
                    person = new Person
                    {
                        PersonId = row["PersonId"].ToString(),
                        FirstName = row["firstName"].ToString(),
                        LastName = row["lastName"].ToString(),
                        Email = row["email"].ToString(),
                        DepartmentID = row["DepartmentID"] != DBNull.Value ? Convert.ToInt32(row["DepartmentID"]) : null,
                        FolderPath = row["folderPath"].ToString(),
                        Username = row["Username"].ToString(),
                        Password = row["password"].ToString(),
                        Position = row["Position"].ToString(),
                        IsActive = Convert.ToBoolean(row["IsActive"]),
                        CreatedDate = row["CreatedDate"] != DBNull.Value ? Convert.ToDateTime(row["CreatedDate"]) : null
                    };
                }

                return person;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int AddPerson(Person person)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PersonId", person.PersonId },
                { "@FirstName", person.FirstName },
                { "@LastName", person.LastName },
                { "@Email", person.Email },
                { "@DepartmentID", person.DepartmentID },
                { "@FolderPath", person.FolderPath },
                { "@Username", person.Username },
                { "@Password", person.Password },
                { "@Position", person.Position },
                { "@IsActive", person.IsActive }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spAddPerson", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int UpdatePerson(Person person)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PersonId", person.PersonId },
                { "@FirstName", person.FirstName },
                { "@LastName", person.LastName },
                { "@Email", person.Email },
                { "@DepartmentID", person.DepartmentID },
                { "@FolderPath", person.FolderPath },
                { "@Username", person.Username },
                { "@Password", person.Password },
                { "@Position", person.Position },
                { "@IsActive", person.IsActive }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spUpdatePerson", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<Role> GetPersonRoles(string personId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PersonId", personId }
            };

            List<Role> roles = new List<Role>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetPersonRoles", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    Role role = new Role
                    {
                        RoleID = Convert.ToInt32(row["RoleID"]),
                        RoleName = row["RoleName"].ToString(),
                        Description = row["Description"].ToString()
                    };
                    roles.Add(role);
                }

                return roles;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int AssignRoleToPerson(string personId, int roleId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PersonId", personId },
                { "@RoleId", roleId }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spAssignRoleToPerson", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int RemoveRoleFromPerson(string personId, int roleId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PersonId", personId },
                { "@RoleId", roleId }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spRemoveRoleFromPerson", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}