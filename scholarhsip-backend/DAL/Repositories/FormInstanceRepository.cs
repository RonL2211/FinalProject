using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FinalProject.DAL.Repositories
{
    public class FormInstanceRepository : DBServices
    {
        public FormInstanceRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public List<FormInstance> GetInstancesByUserId(string userId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@UserId", userId }
            };

            List<FormInstance> instanceList = new List<FormInstance>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetInstancesByUserId", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    FormInstance instance = new FormInstance
                    {
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        FormId = Convert.ToInt32(row["FormId"]),
                        UserID = row["UserID"].ToString(),
                        CreatedDate = row["createdDate"] != DBNull.Value ? Convert.ToDateTime(row["createdDate"]) : null,
                        CurrentStage = row["CurrentStage"].ToString(),
                        TotalScore = row["TotalScore"] != DBNull.Value ? Convert.ToDecimal(row["TotalScore"]) : null,
                        SubmissionDate = row["SubmissionDate"] != DBNull.Value ? Convert.ToDateTime(row["SubmissionDate"]) : null,
                        LastModifiedDate = row["LastModifiedDate"] != DBNull.Value ? Convert.ToDateTime(row["LastModifiedDate"]) : null,
                        Comments = row["Comments"].ToString()
                    };
                    instanceList.Add(instance);
                }

                return instanceList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FormInstance GetInstanceById(int instanceId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetInstanceById", paramDic);
                FormInstance instance = null;

                DataRow row = dataTable.Rows[0];

                if (dataTable.Rows.Count > 0)
                {
                    instance = new FormInstance
                    {
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        FormId = Convert.ToInt32(row["FormId"]),
                        UserID = row["UserID"].ToString(),
                        CreatedDate = row["createdDate"] != DBNull.Value ? Convert.ToDateTime(row["createdDate"]) : null,
                        CurrentStage = row["CurrentStage"].ToString(),
                        TotalScore = row["TotalScore"] != DBNull.Value ? Convert.ToDecimal(row["TotalScore"]) : null,
                        SubmissionDate = row["SubmissionDate"] != DBNull.Value ? Convert.ToDateTime(row["SubmissionDate"]) : null,
                        LastModifiedDate = row["LastModifiedDate"] != DBNull.Value ? Convert.ToDateTime(row["LastModifiedDate"]) : null,
                        Comments = row["Comments"].ToString()
                    };
                }

                return instance;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int CreateInstance(FormInstance instance)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FormId", instance.FormId },
                { "@UserId", instance.UserID },
                { "@CurrentStage", instance.CurrentStage }
            };

            try
            {
                int instanceId = Convert.ToInt32(ExecuteScalar("spCreateInstance", paramDic));
                return instanceId;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int UpdateInstanceStatus(int instanceId, string currentStage, string comments)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId },
                { "@CurrentStage", currentStage },
                { "@Comments", comments }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spUpdateInstanceStatus", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int SubmitInstance(int instanceId, decimal totalScore)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId },
                { "@TotalScore", totalScore }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spSubmitInstance", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<FormInstance> GetInstancesByFormId(int formId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FormId", formId }
            };

            List<FormInstance> instanceList = new List<FormInstance>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetInstancesByFormId", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    FormInstance instance = new FormInstance
                    {
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        FormId = Convert.ToInt32(row["FormId"]),
                        UserID = row["UserID"].ToString(),
                        CreatedDate = row["createdDate"] != DBNull.Value ? Convert.ToDateTime(row["createdDate"]) : null,
                        CurrentStage = row["CurrentStage"].ToString(),
                        TotalScore = row["TotalScore"] != DBNull.Value ? Convert.ToDecimal(row["TotalScore"]) : null,
                        SubmissionDate = row["SubmissionDate"] != DBNull.Value ? Convert.ToDateTime(row["SubmissionDate"]) : null,
                        LastModifiedDate = row["LastModifiedDate"] != DBNull.Value ? Convert.ToDateTime(row["LastModifiedDate"]) : null,
                        Comments = row["Comments"].ToString()
                    };
                    instanceList.Add(instance);
                }

                return instanceList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<FormInstance> GetInstancesByStage(string stage)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@Stage", stage }
            };

            List<FormInstance> instanceList = new List<FormInstance>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetInstancesByStage", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    FormInstance instance = new FormInstance
                    {
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        FormId = Convert.ToInt32(row["FormId"]),
                        UserID = row["UserID"].ToString(),
                        CreatedDate = row["createdDate"] != DBNull.Value ? Convert.ToDateTime(row["createdDate"]) : null,
                        CurrentStage = row["CurrentStage"].ToString(),
                        TotalScore = row["TotalScore"] != DBNull.Value ? Convert.ToDecimal(row["TotalScore"]) : null,
                        SubmissionDate = row["SubmissionDate"] != DBNull.Value ? Convert.ToDateTime(row["SubmissionDate"]) : null,
                        LastModifiedDate = row["LastModifiedDate"] != DBNull.Value ? Convert.ToDateTime(row["LastModifiedDate"]) : null,
                        Comments = row["Comments"].ToString()
                    };
                    instanceList.Add(instance);
                }

                return instanceList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        
        
        public List<FormInstance> GetAllInstances( )
        {

            List<FormInstance> instanceList = new List<FormInstance>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAllInstances" , null);

                foreach (DataRow row in dataTable.Rows)
                {
                    FormInstance instance = new FormInstance
                    {
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        FormId = Convert.ToInt32(row["FormId"]),
                        UserID = row["UserID"].ToString(),
                        CreatedDate = row["createdDate"] != DBNull.Value ? Convert.ToDateTime(row["createdDate"]) : null,
                        CurrentStage = row["CurrentStage"].ToString(),
                        TotalScore = row["TotalScore"] != DBNull.Value ? Convert.ToDecimal(row["TotalScore"]) : null,
                        SubmissionDate = row["SubmissionDate"] != DBNull.Value ? Convert.ToDateTime(row["SubmissionDate"]) : null,
                        LastModifiedDate = row["LastModifiedDate"] != DBNull.Value ? Convert.ToDateTime(row["LastModifiedDate"]) : null,
                        Comments = row["Comments"].ToString()
                    };
                    instanceList.Add(instance);
                }

                return instanceList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}