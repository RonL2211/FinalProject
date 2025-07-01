//using FinalProject.DAL.Models;
//using Microsoft.Extensions.Configuration;
//using System;
//using System.Collections.Generic;
//using System.Data.SqlClient;

//namespace FinalProject.DAL.Repositories
//{
//    public class FormSubSectionRepository : DBServices
//    {
//        public FormSubSectionRepository(IConfiguration configuration) : base(configuration)
//        {
//        }

//        public List<FormSubSection> GetAllFormSubSections()
//        {
//            List<FormSubSection> subSectionList = new List<FormSubSection>();
//            try
//            {
//                SqlDataReader dataReader = ExecuteReader("spGetAllFormSubSections", null);
//                while (dataReader.Read())
//                {
//                    FormSubSection subSection = new FormSubSection
//                    {
//                        SubSectionID = Convert.ToInt32(dataReader["SubSectionID"]),
//                        SectionID = Convert.ToInt32(dataReader["SectionID"]),
//                        FormID = Convert.ToInt32(dataReader["FormID"]),
//                        Title = dataReader["Title"].ToString(),
//                        Explanation = dataReader["Explanation"] != DBNull.Value ? dataReader["Explanation"].ToString() : null,
//                        MaxPoints = dataReader["MaxPoints"] != DBNull.Value ? Convert.ToDecimal(dataReader["MaxPoints"]) : null,
//                        IsRequired = Convert.ToBoolean(dataReader["IsRequired"])
//                    };
//                    subSectionList.Add(subSection);
//                }
//                return subSectionList;
//            }
//            catch (Exception ex)
//            {
//                throw ex;
//            }
//        }

//        public FormSubSection GetFormSubSectionById(int subSectionId)
//        {
//            Dictionary<string, object> paramDic = new Dictionary<string, object>
//            {
//                { "@SubSectionID", subSectionId }
//            };
//            try
//            {
//                SqlDataReader dataReader = ExecuteReader("spGetFormSubSectionById", paramDic);
//                FormSubSection subSection = null;
//                if (dataReader.Read())
//                {
//                    subSection = new FormSubSection
//                    {
//                        SubSectionID = Convert.ToInt32(dataReader["SubSectionID"]),
//                        SectionID = Convert.ToInt32(dataReader["SectionID"]),
//                        FormID = Convert.ToInt32(dataReader["FormID"]),
//                        Title = dataReader["Title"].ToString(),
//                        Explanation = dataReader["Explanation"] != DBNull.Value ? dataReader["Explanation"].ToString() : null,
//                        MaxPoints = dataReader["MaxPoints"] != DBNull.Value ? Convert.ToDecimal(dataReader["MaxPoints"]) : null,
//                        IsRequired = Convert.ToBoolean(dataReader["IsRequired"])
//                    };
//                }
//                return subSection;
//            }
//            catch (Exception ex)
//            {
//                throw ex;
//            }
//        }

//        public List<FormSubSection> GetFormSubSectionsByFormId(int formId)
//        {
//            Dictionary<string, object> paramDic = new Dictionary<string, object>
//            {
//                { "@FormID", formId }
//            };
//            List<FormSubSection> subSectionList = new List<FormSubSection>();
//            try
//            {
//                SqlDataReader dataReader = ExecuteReader("spGetFormSubSectionsByFormId", paramDic);
//                while (dataReader.Read())
//                {
//                    FormSubSection subSection = new FormSubSection
//                    {
//                        SubSectionID = Convert.ToInt32(dataReader["SubSectionID"]),
//                        SectionID = Convert.ToInt32(dataReader["SectionID"]),
//                        FormID = Convert.ToInt32(dataReader["FormID"]),
//                        Title = dataReader["Title"].ToString(),
//                        Explanation = dataReader["Explanation"] != DBNull.Value ? dataReader["Explanation"].ToString() : null,
//                        MaxPoints = dataReader["MaxPoints"] != DBNull.Value ? Convert.ToDecimal(dataReader["MaxPoints"]) : null,
//                        IsRequired = Convert.ToBoolean(dataReader["IsRequired"])
//                    };
//                    subSectionList.Add(subSection);
//                }
//                return subSectionList;
//            }
//            catch (Exception ex)
//            {
//                throw ex;
//            }
//        }

//        public List<FormSubSection> GetFormSubSectionsBySectionId(int sectionId)
//        {
//            Dictionary<string, object> paramDic = new Dictionary<string, object>
//            {
//                { "@SectionID", sectionId }
//            };
//            List<FormSubSection> subSectionList = new List<FormSubSection>();
//            try
//            {
//                SqlDataReader dataReader = ExecuteReader("spGetFormSubSectionsBySectionId", paramDic);
//                while (dataReader.Read())
//                {
//                    FormSubSection subSection = new FormSubSection
//                    {
//                        SubSectionID = Convert.ToInt32(dataReader["SubSectionID"]),
//                        SectionID = Convert.ToInt32(dataReader["SectionID"]),
//                        FormID = Convert.ToInt32(dataReader["FormID"]),
//                        Title = dataReader["Title"].ToString(),
//                        Explanation = dataReader["Explanation"] != DBNull.Value ? dataReader["Explanation"].ToString() : null,
//                        MaxPoints = dataReader["MaxPoints"] != DBNull.Value ? Convert.ToDecimal(dataReader["MaxPoints"]) : null,
//                        IsRequired = Convert.ToBoolean(dataReader["IsRequired"])
//                    };
//                    subSectionList.Add(subSection);
//                }
//                return subSectionList;
//            }
//            catch (Exception ex)
//            {
//                throw ex;
//            }
//        }

//        public int AddFormSubSection(FormSubSection subSection)
//        {
//            Dictionary<string, object> paramDic = new Dictionary<string, object>
//            {
//                { "@SectionID", subSection.SectionID },
//                { "@FormID", subSection.FormID },
//                { "@Title", subSection.Title },
//                { "@Explanation", subSection.Explanation ?? (object)DBNull.Value },
//                { "@MaxPoints", subSection.MaxPoints ?? (object)DBNull.Value },
//                { "@IsRequired", subSection.IsRequired }
//            };
//            try
//            {
//                int numAffected = ExecuteNonQuery("spAddFormSubSection", paramDic);
//                return numAffected;
//            }
//            catch (Exception ex)
//            {
//                throw ex;
//            }
//        }

//        public int UpdateFormSubSection(FormSubSection subSection)
//        {
//            Dictionary<string, object> paramDic = new Dictionary<string, object>
//            {
//                { "@SubSectionID", subSection.SubSectionID },
//                { "@SectionID", subSection.SectionID },
//                { "@FormID", subSection.FormID },
//                { "@Title", subSection.Title },
//                { "@Explanation", subSection.Explanation ?? (object)DBNull.Value },
//                { "@MaxPoints", subSection.MaxPoints ?? (object)DBNull.Value },
//                { "@IsRequired", subSection.IsRequired }
//            };
//            try
//            {
//                int numAffected = ExecuteNonQuery("spUpdateFormSubSection", paramDic);
//                return numAffected;
//            }
//            catch (Exception ex)
//            {
//                throw ex;
//            }
//        }

//        public int DeleteFormSubSection(int subSectionId)
//        {
//            Dictionary<string, object> paramDic = new Dictionary<string, object>
//            {
//                { "@SubSectionID", subSectionId }
//            };
//            try
//            {
//                int numAffected = ExecuteNonQuery("spDeleteFormSubSection", paramDic);
//                return numAffected;
//            }
//            catch (Exception ex)
//            {
//                throw ex;
//            }
//        }
//    }
//}