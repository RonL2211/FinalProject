//AppealRepository.cs
using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FinalProject.DAL.Repositories
{
    public class AppealRepository : DBServices
    {
        public AppealRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public int CreateAppeal(Appeal appeal)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", appeal.InstanceId },
                { "@AppealReason", appeal.AppealReason }
            };

            try
            {
                object result = ExecuteScalar("spCreateAppeal", paramDic);
                return result != null ? Convert.ToInt32(result) : -1;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<Appeal> GetPendingAppeals()
        {
            List<Appeal> appealList = new List<Appeal>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetPendingAppeals");

                    foreach(DataRow row in dataTable.Rows) 
                    {
                    Appeal appeal = new Appeal
                    {
                        AppealID = Convert.ToInt32(row["AppealID"]),
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        AppealReason = row["AppealReason"].ToString(),
                        AppealDate = Convert.ToDateTime(row["AppealDate"]),
                        AppealStatus = row["AppealStatus"].ToString(),
                        ReviewerResponse = row["ReviewerResponse"]?.ToString(),
                        ReviewDate = row["ReviewDate"] != DBNull.Value ? Convert.ToDateTime(row["ReviewDate"]) : null,
                        ReviewedBy = row["ReviewedBy"]?.ToString()
                    };
                    appealList.Add(appeal);
                }

                return appealList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Appeal GetAppealById(int appealId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@AppealID", appealId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAppealById", paramDic);
                Appeal appeal = null;
                DataRow row = dataTable.Rows[0];

                if (dataTable.Rows.Count > 0)
                {
                    appeal = new Appeal
                    {
                        AppealID = Convert.ToInt32(row["AppealID"]),
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        AppealReason = row["AppealReason"].ToString(),
                        AppealDate = Convert.ToDateTime(row["AppealDate"]),
                        AppealStatus = row["AppealStatus"].ToString(),
                        ReviewerResponse = row["ReviewerResponse"]?.ToString(),
                        ReviewDate = row["ReviewDate"] != DBNull.Value ? Convert.ToDateTime(row["ReviewDate"]) : null,
                        ReviewedBy = row["ReviewedBy"]?.ToString()
                    };
                }

                return appeal;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int RespondToAppeal(int appealId, string appealStatus, string reviewerResponse, string reviewedBy)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@AppealID", appealId },
                { "@AppealStatus", appealStatus },
                { "@ReviewerResponse", reviewerResponse },
                { "@ReviewedBy", reviewedBy }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spRespondToAppeal", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<Appeal> GetAppealsByInstanceId(int instanceId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId }
            };

            List<Appeal> appealList = new List<Appeal>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAppealsByInstanceId", paramDic);

                foreach (DataRow row in dataTable.Rows) 
                {
                    Appeal appeal = new Appeal
                    {
                        AppealID = Convert.ToInt32(row["AppealID"]),
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        AppealReason = row["AppealReason"] != DBNull.Value ? row["AppealReason"].ToString() : null,
                        AppealDate = Convert.ToDateTime(row["AppealDate"]),
                        AppealStatus = row["AppealStatus"].ToString(),
                        ReviewerResponse = row["ReviewerResponse"]?.ToString(),
                        ReviewDate = row["ReviewDate"] != DBNull.Value ? Convert.ToDateTime(row["ReviewDate"]) : null,
                        ReviewedBy = row["ReviewedBy"]?.ToString()
                    };
                    appealList.Add(appeal);
                }

                return appealList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}