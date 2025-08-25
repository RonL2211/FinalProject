using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FinalProject.DAL.Repositories
{
    public class DepartmentRepository : DBServices
    {
        public DepartmentRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public List<Department> GetAllDepartments()
        {
            List<Department> departmentList = new List<Department>();
            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAllDepartments", null);
                

                foreach (DataRow row in dataTable.Rows) 
                {
                    Department department = new Department
                    {
                        DepartmentID = Convert.ToInt32(row["DepartmentID"]),
                        DepartmentName = row["DepartmentName"].ToString(),
                        FacultyId = row["FacultyId"] != DBNull.Value ? Convert.ToInt32(row["FacultyId"]) : null
                    };
                    departmentList.Add(department);
                }

                return departmentList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Department GetDepartmentById(int departmentId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@DepartmentId", departmentId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetDepartmentById", paramDic);
                Department department = null;

                DataRow row = dataTable.Rows[0];    

                if (dataTable.Rows.Count > 0)
                {
                    department = new Department
                    {
                        DepartmentID = Convert.ToInt32(row["DepartmentID"]),
                        DepartmentName = row["DepartmentName"].ToString(),
                        FacultyId = row["FacultyId"] != DBNull.Value ? Convert.ToInt32(row["FacultyId"]) : null
                    };
                }

                return department;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<Department> GetDepartmentsByFacultyId(int facultyId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FacultyId", facultyId }
            };

            List<Department> departmentList = new List<Department>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetDepartmentsByFacultyId", paramDic);

                foreach (DataRow row in dataTable.Rows) 
                {
                    Department department = new Department
                    {
                        DepartmentID = Convert.ToInt32(row["DepartmentID"]),
                        DepartmentName = row["DepartmentName"].ToString(),
                        FacultyId = row["FacultyId"] != DBNull.Value ? Convert.ToInt32(row["FacultyId"]) : null
                    };
                    departmentList.Add(department);
                }

                return departmentList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<Faculty> GetAllFaculties()
        {
            List<Faculty> facultyList = new List<Faculty>();
            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAllFaculties", null);

                foreach (DataRow row in dataTable.Rows)
                {
                    Faculty faculty = new Faculty
                    {
                        FacultyID = Convert.ToInt32(row["FacultyID"]),
                        FacultyName = row["FacultyName"].ToString()
                    };
                    facultyList.Add(faculty);
                }

                return facultyList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Faculty GetFacultyById(int facultyId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FacultyId", facultyId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetFacultyById", paramDic);
                Faculty faculty = null;

                DataRow row = dataTable.Rows[0];

                if (dataTable.Rows.Count > 0)
                {
                    faculty = new Faculty
                    {
                        FacultyID = Convert.ToInt32(row["FacultyID"]),
                        FacultyName = row["FacultyName"].ToString()
                    };
                }

                return faculty;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}