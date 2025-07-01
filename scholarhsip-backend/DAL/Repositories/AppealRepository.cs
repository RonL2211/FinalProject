//AppealRepository.cs
using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
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
                SqlDataReader dataReader = ExecuteReader("spGetPendingAppeals", null);

                while (dataReader.Read())
                {
                    Appeal appeal = new Appeal
                    {
                        AppealID = Convert.ToInt32(dataReader["AppealID"]),
                        InstanceId = Convert.ToInt32(dataReader["InstanceId"]),
                        AppealReason = dataReader["AppealReason"].ToString(),
                        AppealDate = Convert.ToDateTime(dataReader["AppealDate"]),
                        AppealStatus = dataReader["AppealStatus"].ToString(),
                        ReviewerResponse = dataReader["ReviewerResponse"]?.ToString(),
                        ReviewDate = dataReader["ReviewDate"] != DBNull.Value ? Convert.ToDateTime(dataReader["ReviewDate"]) : null,
                        ReviewedBy = dataReader["ReviewedBy"]?.ToString()
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
                SqlDataReader dataReader = ExecuteReader("spGetAppealById", paramDic);
                Appeal appeal = null;

                if (dataReader.Read())
                {
                    appeal = new Appeal
                    {
                        AppealID = Convert.ToInt32(dataReader["AppealID"]),
                        InstanceId = Convert.ToInt32(dataReader["InstanceId"]),
                        AppealReason = dataReader["AppealReason"].ToString(),
                        AppealDate = Convert.ToDateTime(dataReader["AppealDate"]),
                        AppealStatus = dataReader["AppealStatus"].ToString(),
                        ReviewerResponse = dataReader["ReviewerResponse"]?.ToString(),
                        ReviewDate = dataReader["ReviewDate"] != DBNull.Value ? Convert.ToDateTime(dataReader["ReviewDate"]) : null,
                        ReviewedBy = dataReader["ReviewedBy"]?.ToString()
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
                SqlDataReader dataReader = ExecuteReader("spGetAppealsByInstanceId", paramDic);

                while (dataReader.Read())
                {
                    Appeal appeal = new Appeal
                    {
                        AppealID = Convert.ToInt32(dataReader["AppealID"]),
                        InstanceId = Convert.ToInt32(dataReader["InstanceId"]),
                        AppealReason = dataReader["AppealReason"].ToString(),
                        AppealDate = Convert.ToDateTime(dataReader["AppealDate"]),
                        AppealStatus = dataReader["AppealStatus"].ToString(),
                        ReviewerResponse = dataReader["ReviewerResponse"]?.ToString(),
                        ReviewDate = dataReader["ReviewDate"] != DBNull.Value ? Convert.ToDateTime(dataReader["ReviewDate"]) : null,
                        ReviewedBy = dataReader["ReviewedBy"]?.ToString()
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