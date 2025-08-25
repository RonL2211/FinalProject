using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FinalProject.DAL.Repositories
{
    public class FormSectionRepository : DBServices
    {
        public FormSectionRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public List<FormSection> GetSectionsByFormId(int formId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FormId", formId }
            };

            List<FormSection> sectionList = new List<FormSection>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetSectionsByFormId", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    FormSection section = new FormSection
                    {
                        SectionID = Convert.ToInt32(row["SectionID"]),
                        FormId = Convert.ToInt32(row["formId"]),
                        ParentSectionID = row["ParentSectionID"] != DBNull.Value ? Convert.ToInt32(row["ParentSectionID"]) : null,
                        Level = Convert.ToByte(row["Level"]),
                        OrderIndex = Convert.ToInt32(row["OrderIndex"]),
                        Title = row["Title"].ToString(),
                        Description = row["Description"].ToString(),
                        Explanation = row["Explanation"].ToString(),
                        MaxPoints = row["MaxPoints"] != DBNull.Value ? Convert.ToDecimal(row["MaxPoints"]) : null,
                        ResponsibleEntity = row["ResponsibleEntity"] != DBNull.Value ? Convert.ToInt32(row["ResponsibleEntity"]) : null,
                        ResponsiblePerson = row["ResponsiblePerson"]?.ToString(),
                        IsRequired = Convert.ToBoolean(row["IsRequired"]),
                        IsVisible = Convert.ToBoolean(row["IsVisible"]),
                        MaxOccurrences = row["MaxOccurrences"] != DBNull.Value ? Convert.ToInt32(row["MaxOccurrences"]) : null
                    };
                    sectionList.Add(section);
                }

                return sectionList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FormSection GetSectionById(int sectionId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@SectionId", sectionId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetSectionById", paramDic);
                FormSection section = null;
            DataRow row = dataTable.Rows[0];
                if (dataTable.Rows.Count > 0)
                {
                    section = new FormSection
                    {
                        SectionID = Convert.ToInt32(row["SectionID"]),
                        FormId = Convert.ToInt32(row["formId"]),
                        ParentSectionID = row["ParentSectionID"] != DBNull.Value ? Convert.ToInt32(row["ParentSectionID"]) : null,
                        Level = Convert.ToByte(row["Level"]),
                        OrderIndex = Convert.ToInt32(row["OrderIndex"]),
                        Title = row["Title"].ToString(),
                        Description = row["Description"].ToString(),
                        Explanation = row["Explanation"].ToString(),
                        MaxPoints = row["MaxPoints"] != DBNull.Value ? Convert.ToDecimal(row["MaxPoints"]) : null,
                        ResponsibleEntity = row["ResponsibleEntity"] != DBNull.Value ? Convert.ToInt32(row["ResponsibleEntity"]) : null,
                        ResponsiblePerson = row["ResponsiblePerson"]?.ToString(),
                        IsRequired = Convert.ToBoolean(row["IsRequired"]),
                        IsVisible = Convert.ToBoolean(row["IsVisible"]),
                        MaxOccurrences = row["MaxOccurrences"] != DBNull.Value ? Convert.ToInt32(row["MaxOccurrences"]) : null
                    };
                }

                return section;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int AddSection(FormSection section)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FormId", section.FormId },
                { "@ParentSectionID", section.ParentSectionID },
                { "@Level", section.Level },
                { "@OrderIndex", section.OrderIndex },
                { "@Title", section.Title },
                { "@Description", section.Description },
                { "@Explanation", section.Explanation },
                { "@MaxPoints", section.MaxPoints },
                { "@ResponsibleEntity", section.ResponsibleEntity },
                { "@ResponsiblePerson", section.ResponsiblePerson },
                { "@IsRequired", section.IsRequired },
                { "@IsVisible", section.IsVisible },
                { "@MaxOccurrences", section.MaxOccurrences }
            };

            try
            {
                int sectionId = Convert.ToInt32(ExecuteScalar("spAddSection", paramDic));
                return sectionId;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int UpdateSection(FormSection section)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@SectionId", section.SectionID },
                { "@Title", section.Title },
                { "@Description", section.Description },
                { "@Explanation", section.Explanation },
                { "@MaxPoints", section.MaxPoints },
                { "@ResponsibleEntity", section.ResponsibleEntity },
                { "@ResponsiblePerson", section.ResponsiblePerson },
                { "@IsRequired", section.IsRequired },
                { "@IsVisible", section.IsVisible },
                { "@MaxOccurrences", section.MaxOccurrences },
                { "@OrderIndex", section.OrderIndex }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spUpdateSection", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int DeleteSection(int sectionId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@SectionId", sectionId }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spDeleteSection", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<FormSection> GetChildSections(int parentSectionId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@ParentSectionId", parentSectionId }
            };

            List<FormSection> sectionList = new List<FormSection>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetChildSections", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    FormSection section = new FormSection
                    {
                        SectionID = Convert.ToInt32(row["SectionID"]),
                        FormId = Convert.ToInt32(row["formId"]),
                        ParentSectionID = row["ParentSectionID"] != DBNull.Value ? Convert.ToInt32(row["ParentSectionID"]) : null,
                        Level = Convert.ToByte(row["Level"]),
                        OrderIndex = Convert.ToInt32(row["OrderIndex"]),
                        Title = row["Title"].ToString(),
                        Description = row["Description"].ToString(),
                        Explanation = row["Explanation"].ToString(),
                        MaxPoints = row["MaxPoints"] != DBNull.Value ? Convert.ToDecimal(row["MaxPoints"]) : null,
                        ResponsibleEntity = row["ResponsibleEntity"] != DBNull.Value ? Convert.ToInt32(row["ResponsibleEntity"]) : null,
                        ResponsiblePerson = row["ResponsiblePerson"]?.ToString(),
                        IsRequired = Convert.ToBoolean(row["IsRequired"]),
                        IsVisible = Convert.ToBoolean(row["IsVisible"]),
                        MaxOccurrences = row["MaxOccurrences"] != DBNull.Value ? Convert.ToInt32(row["MaxOccurrences"]) : null
                    };
                    sectionList.Add(section);
                }

                return sectionList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}