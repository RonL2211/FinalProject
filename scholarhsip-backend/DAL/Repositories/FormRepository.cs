using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FinalProject.DAL.Repositories
{
    public class FormRepository : DBServices
    {
        public FormRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public List<Form> GetAllForms()
        {
            List<Form> formList = new List<Form>();
            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAllForms", null);

                foreach (DataRow row in dataTable.Rows)
                {
                    Form form = new Form
                    {
                        FormID = Convert.ToInt32(row["FormID"]),
                        FormName = row["formName"].ToString(),
                        CreationDate = row["creationDate"] != DBNull.Value ? Convert.ToDateTime(row["creationDate"]) : null,
                        DueDate = row["dueDate"] != DBNull.Value ? Convert.ToDateTime(row["dueDate"]) : null,
                        Description = row["description"].ToString(),
                        Instructions = row["instructions"].ToString(),
                        AcademicYear = row["AcademicYear"].ToString(),
                        Semester = row["Semester"] != DBNull.Value ? Convert.ToChar(row["Semester"]) : null,
                        StartDate = row["StartDate"] != DBNull.Value ? Convert.ToDateTime(row["StartDate"]) : null,
                        CreatedBy = row["CreatedBy"].ToString(),
                        LastModifiedBy = row["LastModifiedBy"]?.ToString(),
                        LastModifiedDate = row["LastModifiedDate"] != DBNull.Value ? Convert.ToDateTime(row["LastModifiedDate"]) : null,
                        IsActive = Convert.ToBoolean(row["IsActive"]),
                        IsPublished = Convert.ToBoolean(row["IsPublished"])
                    };
                    formList.Add(form);
                }

                return formList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Form GetFormById(int formId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FormId", formId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetFormById", paramDic);
                Form form = null;
            DataRow row = dataTable.Rows[0];
                if (dataTable.Rows.Count > 0)
                {
                    form = new Form
                    {
                        FormID = Convert.ToInt32(row["FormID"]),
                        FormName = row["formName"].ToString(),
                        CreationDate = row["creationDate"] != DBNull.Value ? Convert.ToDateTime(row["creationDate"]) : null,
                        DueDate = row["dueDate"] != DBNull.Value ? Convert.ToDateTime(row["dueDate"]) : null,
                        Description = row["description"].ToString(),
                        Instructions = row["instructions"].ToString(),
                        AcademicYear = row["AcademicYear"].ToString(),
                        Semester = row["Semester"] != DBNull.Value ? Convert.ToChar(row["Semester"]) : null,
                        StartDate = row["StartDate"] != DBNull.Value ? Convert.ToDateTime(row["StartDate"]) : null,
                        CreatedBy = row["CreatedBy"].ToString(),
                        LastModifiedBy = row["LastModifiedBy"]?.ToString(),
                        LastModifiedDate = row["LastModifiedDate"] != DBNull.Value ? Convert.ToDateTime(row["LastModifiedDate"]) : null,
                        IsActive = Convert.ToBoolean(row["IsActive"]),
                        IsPublished = Convert.ToBoolean(row["IsPublished"])
                    };
                }

                return form;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int AddForm(Form form)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FormName", form.FormName },
                { "@Description", form.Description },
                { "@Instructions", form.Instructions },
                { "@AcademicYear", form.AcademicYear },
                { "@Semester", form.Semester },
                { "@StartDate", form.StartDate },
                { "@DueDate", form.DueDate },
                { "@CreatedBy", form.CreatedBy },
                { "@IsActive", form.IsActive },
                { "@IsPublished", form.IsPublished }
            };

            try
            {
                int formId = Convert.ToInt32(ExecuteScalar("spAddForm", paramDic));


                return formId;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int UpdateForm(Form form)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FormId", form.FormID },
                { "@FormName", form.FormName },
                { "@Description", form.Description },
                { "@Instructions", form.Instructions },
                { "@AcademicYear", form.AcademicYear },
                { "@Semester", form.Semester },
                { "@StartDate", form.StartDate },
                { "@DueDate", form.DueDate },
                { "@LastModifiedBy", form.LastModifiedBy },
                { "@IsActive", form.IsActive },
                { "@IsPublished", form.IsPublished }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spUpdateForm", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int PublishForm(int formId, string modifiedBy)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FormId", formId },
                { "@LastModifiedBy", modifiedBy }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spPublishForm", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<Form> GetFormsByAcademicYear(string academicYear)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@AcademicYear", academicYear }
            };

            List<Form> formList = new List<Form>();
            try
            {
                DataTable dataTable =  ExecuteQuery("spGetFormsByAcademicYear", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    Form form = new Form
                    {
                        FormID = Convert.ToInt32(row["FormID"]),
                        FormName = row["formName"].ToString(),
                        CreationDate = row["creationDate"] != DBNull.Value ? Convert.ToDateTime(row["creationDate"]) : null,
                        DueDate = row["dueDate"] != DBNull.Value ? Convert.ToDateTime(row["dueDate"]) : null,
                        Description = row["description"].ToString(),
                        Instructions = row["instructions"].ToString(),
                        AcademicYear = row["AcademicYear"].ToString(),
                        Semester = row["Semester"] != DBNull.Value ? Convert.ToChar(row["Semester"]) : null,
                        StartDate = row["StartDate"] != DBNull.Value ? Convert.ToDateTime(row["StartDate"]) : null,
                        CreatedBy = row["CreatedBy"].ToString(),
                        LastModifiedBy = row["LastModifiedBy"]?.ToString(),
                        LastModifiedDate = row["LastModifiedDate"] != DBNull.Value ? Convert.ToDateTime(row["LastModifiedDate"]) : null,
                        IsActive = Convert.ToBoolean(row["IsActive"]),
                        IsPublished = Convert.ToBoolean(row["IsPublished"])
                    };
                    formList.Add(form);
                }

                return formList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}