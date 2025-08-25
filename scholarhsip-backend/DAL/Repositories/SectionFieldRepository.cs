using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FinalProject.DAL.Repositories
{
    public class SectionFieldRepository : DBServices
    {
        public SectionFieldRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public List<SectionField> GetFieldsBySectionId(int sectionId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@SectionId", sectionId }
            };

            List<SectionField> fieldList = new List<SectionField>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetFieldsBySectionId", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    SectionField field = new SectionField
                    {
                        FieldID = Convert.ToInt32(row["FieldID"]),
                        SectionID = row["SectionID"] != DBNull.Value ? Convert.ToInt32(row["SectionID"]) : null,
                        FieldName = row["FieldName"].ToString(),
                        FieldLabel = row["FieldLabel"].ToString(),
                        FieldType = row["FieldType"].ToString(),
                        IsRequired = Convert.ToBoolean(row["IsRequired"]),
                        DefaultValue = row["DefaultValue"].ToString(),
                        Placeholder = row["Placeholder"].ToString(),
                        HelpText = row["HelpText"].ToString(),
                        OrderIndex = Convert.ToInt32(row["OrderIndex"]),
                        IsVisible = Convert.ToBoolean(row["IsVisible"]),
                        MaxLength = row["MaxLength"] != DBNull.Value ? Convert.ToInt32(row["MaxLength"]) : null,
                        MinValue = row["MinValue"] != DBNull.Value ? Convert.ToDecimal(row["MinValue"]) : null,
                        MaxValue = row["MaxValue"] != DBNull.Value ? Convert.ToDecimal(row["MaxValue"]) : null,
                        ScoreCalculationRule = row["ScoreCalculationRule"].ToString(),
                        IsActive = Convert.ToBoolean(row["IsActive"])
                    };
                    fieldList.Add(field);
                }

                return fieldList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public SectionField GetFieldById(int fieldId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FieldId", fieldId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetFieldById", paramDic);
                SectionField field = null;
                    DataRow row = dataTable.Rows[0];

                if (dataTable.Rows.Count > 0)
                
                {
                    field = new SectionField
                    {
                        FieldID = Convert.ToInt32(row["FieldID"]),
                        SectionID = row["SectionID"] != DBNull.Value ? Convert.ToInt32(row["SectionID"]) : null,
                        FieldName = row["FieldName"].ToString(),
                        FieldLabel = row["FieldLabel"].ToString(),
                        FieldType = row["FieldType"].ToString(),
                        IsRequired = Convert.ToBoolean(row["IsRequired"]),
                        DefaultValue = row["DefaultValue"].ToString(),
                        Placeholder = row["Placeholder"].ToString(),
                        HelpText = row["HelpText"].ToString(),
                        OrderIndex = Convert.ToInt32(row["OrderIndex"]),
                        IsVisible = Convert.ToBoolean(row["IsVisible"]),
                        MaxLength = row["MaxLength"] != DBNull.Value ? Convert.ToInt32(row["MaxLength"]) : null,
                        MinValue = row["MinValue"] != DBNull.Value ? Convert.ToDecimal(row["MinValue"]) : null,
                        MaxValue = row["MaxValue"] != DBNull.Value ? Convert.ToDecimal(row["MaxValue"]) : null,
                        ScoreCalculationRule = row["ScoreCalculationRule"].ToString(),
                        IsActive = Convert.ToBoolean(row["IsActive"])
                    };
                }

                return field;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int AddField(SectionField field)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@SectionId", field.SectionID },
                { "@FieldName", field.FieldName },
                { "@FieldLabel", field.FieldLabel },
                { "@FieldType", field.FieldType },
                { "@IsRequired", field.IsRequired },
                { "@DefaultValue", field.DefaultValue },
                { "@Placeholder", field.Placeholder },
                { "@HelpText", field.HelpText },
                { "@OrderIndex", field.OrderIndex },
                { "@IsVisible", field.IsVisible },
                { "@MaxLength", field.MaxLength },
                { "@MinValue", field.MinValue },
                { "@MaxValue", field.MaxValue },
                { "@ScoreCalculationRule", field.ScoreCalculationRule },
                { "@IsActive", field.IsActive }
            };

            try
            {
                int fieldId = Convert.ToInt32(ExecuteScalar("spAddField", paramDic));
                return fieldId;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int UpdateField(SectionField field)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FieldId", field.FieldID },
                { "@FieldName", field.FieldName },
                { "@FieldLabel", field.FieldLabel },
                { "@FieldType", field.FieldType },
                { "@IsRequired", field.IsRequired },
                { "@DefaultValue", field.DefaultValue },
                { "@Placeholder", field.Placeholder },
                { "@HelpText", field.HelpText },
                { "@OrderIndex", field.OrderIndex },
                { "@IsVisible", field.IsVisible },
                { "@MaxLength", field.MaxLength },
                { "@MinValue", field.MinValue },
                { "@MaxValue", field.MaxValue },
                { "@ScoreCalculationRule", field.ScoreCalculationRule },
                { "@IsActive", field.IsActive }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spUpdateField", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int DeleteField(int fieldId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FieldId", fieldId }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spDeleteField", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<FieldOption> GetFieldOptions(int fieldId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FieldId", fieldId }
            };

            List<FieldOption> optionList = new List<FieldOption>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetFieldOptions", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    FieldOption option = new FieldOption
                    {
                        OptionID = Convert.ToInt32(row["OptionID"]),
                        FieldID = Convert.ToInt32(row["FieldID"]),
                        OptionValue = row["OptionValue"].ToString(),
                        OptionLabel = row["OptionLabel"].ToString(),
                        ScoreValue = row["ScoreValue"] != DBNull.Value ? Convert.ToDecimal(row["ScoreValue"]) : null,
                        OrderIndex = Convert.ToInt32(row["OrderIndex"]),
                        IsDefault = Convert.ToBoolean(row["IsDefault"])
                    };
                    optionList.Add(option);
                }

                return optionList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int AddFieldOption(FieldOption option)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@FieldId", option.FieldID },
                { "@OptionValue", option.OptionValue },
                { "@OptionLabel", option.OptionLabel },
                { "@ScoreValue", option.ScoreValue },
                { "@OrderIndex", option.OrderIndex },
                { "@IsDefault", option.IsDefault }
            };

            try
            {
                int optionId = Convert.ToInt32(ExecuteScalar("spAddFieldOption", paramDic));
                return optionId;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int UpdateFieldOption(FieldOption option)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@OptionId", option.OptionID },
                { "@OptionValue", option.OptionValue },
                { "@OptionLabel", option.OptionLabel },
                { "@ScoreValue", option.ScoreValue },
                { "@OrderIndex", option.OrderIndex },
                { "@IsDefault", option.IsDefault }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spUpdateFieldOption", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public FieldOption GetFieldOptionById(int optionId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
    {
        { "@OptionId", optionId }
    };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetFieldOptionById", paramDic);
                FieldOption option = null;
                    DataRow row = dataTable.Rows[0];

                if (dataTable.Rows.Count > 0)
                {
                    option = new FieldOption
                    {
                        OptionID = Convert.ToInt32(row["OptionID"]),
                        FieldID = Convert.ToInt32(row["FieldID"]),
                        OptionValue = row["OptionValue"].ToString(),
                        OptionLabel = row["OptionLabel"].ToString(),
                        ScoreValue = row["ScoreValue"] != DBNull.Value ? Convert.ToDecimal(row["ScoreValue"]) : null,
                        OrderIndex = Convert.ToInt32(row["OrderIndex"]),
                        IsDefault = Convert.ToBoolean(row["IsDefault"])
                    };
                }

                return option;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int DeleteFieldOption(int optionId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@OptionId", optionId }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spDeleteFieldOption", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}