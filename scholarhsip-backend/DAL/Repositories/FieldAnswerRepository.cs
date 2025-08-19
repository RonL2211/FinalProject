// FieldAnswerRepository.cs - להוסיף ב-DAL/Repositories
using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
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
                SqlDataReader dataReader = ExecuteReader("spGetAnswersByInstanceId", paramDic);

                while (dataReader.Read())
                {
                    FieldAnswerInstance answer = new FieldAnswerInstance
                    {
                        InstanceId = Convert.ToInt32(dataReader["InstanceId"]),
                        FieldID = Convert.ToInt32(dataReader["FieldID"]),
                        Answer = dataReader["Answer"].ToString(),
                        AnswerDate = dataReader["answerDate"] != DBNull.Value ?
                            Convert.ToDateTime(dataReader["answerDate"]) : null,
                        UpdateDate = dataReader["updateDate"] != DBNull.Value ?
                            Convert.ToDateTime(dataReader["updateDate"]) : null
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
                SqlDataReader dataReader = ExecuteReader("spGetAnswer", paramDic);
                FieldAnswerInstance answer = null;

                if (dataReader.Read())
                {
                    answer = new FieldAnswerInstance
                    {
                        InstanceId = Convert.ToInt32(dataReader["InstanceId"]),
                        FieldID = Convert.ToInt32(dataReader["FieldID"]),
                        Answer = dataReader["Answer"].ToString(),
                        AnswerDate = dataReader["answerDate"] != DBNull.Value ?
                            Convert.ToDateTime(dataReader["answerDate"]) : null,
                        UpdateDate = dataReader["updateDate"] != DBNull.Value ?
                            Convert.ToDateTime(dataReader["updateDate"]) : null
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
                SqlDataReader dataReader = ExecuteReader("spGetAnswerStatistics", paramDic);
                AnswerStatistics stats = new AnswerStatistics();

                if (dataReader.Read())
                {
                    stats.TotalFields = dataReader["TotalFields"] != DBNull.Value ?
                        Convert.ToInt32(dataReader["TotalFields"]) : 0;
                    stats.AnsweredFields = dataReader["AnsweredFields"] != DBNull.Value ?
                        Convert.ToInt32(dataReader["AnsweredFields"]) : 0;
                    stats.RequiredFieldsAnswered = dataReader["RequiredFieldsAnswered"] != DBNull.Value ?
                        Convert.ToInt32(dataReader["RequiredFieldsAnswered"]) : 0;
                    stats.LastUpdateDate = dataReader["LastUpdateDate"] != DBNull.Value ?
                        Convert.ToDateTime(dataReader["LastUpdateDate"]) : null;
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