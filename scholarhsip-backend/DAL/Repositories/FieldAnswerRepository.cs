// FieldAnswerRepository.cs - להוסיף ב-DAL/Repositories
using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FinalProject.DAL.Repositories
{
    public class FieldAnswerRepository : DBServices
    {
        public FieldAnswerRepository(IConfiguration configuration) : base(configuration)
        {
        }

        /// <summary>
        /// קבלת כל התשובות של מופע
        /// </summary>
        public List<FieldAnswerInstance> GetAnswersByInstanceId(int instanceId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId }
            };

            List<FieldAnswerInstance> answerList = new List<FieldAnswerInstance>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAnswersByInstanceId", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    FieldAnswerInstance answer = new FieldAnswerInstance
                    {
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        FieldID = Convert.ToInt32(row["FieldID"]),
                        Answer = row["Answer"].ToString(),
                        AnswerDate = row["answerDate"] != DBNull.Value ?
                            Convert.ToDateTime(row["answerDate"]) : null,
                        UpdateDate = row["updateDate"] != DBNull.Value ?
                            Convert.ToDateTime(row["updateDate"]) : null
                    };
                    answerList.Add(answer);
                }

                return answerList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// קבלת תשובה ספציפית
        /// </summary>
        public FieldAnswerInstance GetAnswer(int instanceId, int fieldId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId },
                { "@FieldId", fieldId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAnswer", paramDic);
                FieldAnswerInstance answer = null;

                DataRow row = dataTable.Rows[0];

                if (dataTable.Rows.Count > 0)
                {
                    answer = new FieldAnswerInstance
                    {
                        InstanceId = Convert.ToInt32(row["InstanceId"]),
                        FieldID = Convert.ToInt32(row["FieldID"]),
                        Answer = row["Answer"].ToString(),
                        AnswerDate = row["answerDate"] != DBNull.Value ?
                            Convert.ToDateTime(row["answerDate"]) : null,
                        UpdateDate = row["updateDate"] != DBNull.Value ?
                            Convert.ToDateTime(row["updateDate"]) : null
                    };
                }

                return answer;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// הוספה או עדכון תשובה
        /// </summary>
        public int SaveOrUpdateAnswer(FieldAnswerInstance answer)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", answer.InstanceId },
                { "@FieldId", answer.FieldID },
                { "@Answer", answer.Answer ?? "" }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spSaveOrUpdateAnswer", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// הוספת תשובה חדשה
        /// </summary>
        public int AddAnswer(FieldAnswerInstance answer)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", answer.InstanceId },
                { "@FieldId", answer.FieldID },
                { "@Answer", answer.Answer ?? "" }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spAddAnswer", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// עדכון תשובה קיימת
        /// </summary>
        public int UpdateAnswer(FieldAnswerInstance answer)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", answer.InstanceId },
                { "@FieldId", answer.FieldID },
                { "@Answer", answer.Answer ?? "" }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spUpdateAnswer", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// מחיקת תשובה
        /// </summary>
        public int DeleteAnswer(int instanceId, int fieldId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId },
                { "@FieldId", fieldId }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spDeleteAnswer", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// מחיקת כל התשובות של מופע
        /// </summary>
        public int DeleteAllAnswersByInstanceId(int instanceId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spDeleteAllAnswersByInstanceId", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// בדיקה אם קיימת תשובה
        /// </summary>
        public bool AnswerExists(int instanceId, int fieldId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId },
                { "@FieldId", fieldId }
            };

            try
            {
                object result = ExecuteScalar("spCheckAnswerExists", paramDic);
                return Convert.ToInt32(result) > 0;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// שמירת מספר תשובות בבת אחת
        /// </summary>
        public int SaveMultipleAnswers(int instanceId, List<FieldAnswerInstance> answers)
        {
            int totalAffected = 0;

            try
            {
                foreach (var answer in answers)
                {
                    answer.InstanceId = instanceId; // וודא שה-InstanceId נכון
                    totalAffected += SaveOrUpdateAnswer(answer);
                }

                return totalAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// קבלת סטטיסטיקות תשובות למופע
        /// </summary>
        public AnswerStatistics GetAnswerStatistics(int instanceId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@InstanceId", instanceId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetAnswerStatistics", paramDic);
                AnswerStatistics stats = new AnswerStatistics();

                DataRow row = dataTable.Rows[0];
                if (dataTable.Rows.Count > 0)
                {
                    stats.TotalFields = row["TotalFields"] != DBNull.Value ?
                        Convert.ToInt32(row["TotalFields"]) : 0;
                    stats.AnsweredFields = row["AnsweredFields"] != DBNull.Value ?
                        Convert.ToInt32(row["AnsweredFields"]) : 0;
                    stats.RequiredFieldsAnswered = row["RequiredFieldsAnswered"] != DBNull.Value ?
                        Convert.ToInt32(row["RequiredFieldsAnswered"]) : 0;
                    stats.LastUpdateDate = row["LastUpdateDate"] != DBNull.Value ?
                        Convert.ToDateTime(row["LastUpdateDate"]) : null;
                }

                return stats;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }

    /// <summary>
    /// מודל לסטטיסטיקות תשובות
    /// </summary>
    public class AnswerStatistics
    {
        public int TotalFields { get; set; }
        public int AnsweredFields { get; set; }
        public int RequiredFieldsAnswered { get; set; }
        public DateTime? LastUpdateDate { get; set; }
        public decimal CompletionPercentage =>
            TotalFields > 0 ? (decimal)AnsweredFields / TotalFields * 100 : 0;
    }
}