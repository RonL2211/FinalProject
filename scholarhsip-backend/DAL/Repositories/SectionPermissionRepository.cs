using FinalProject.DAL.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace FinalProject.DAL.Repositories
{
    public class SectionPermissionRepository : DBServices
    {
        public SectionPermissionRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public List<SectionPermission> GetSectionPermissions(int sectionId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@SectionId", sectionId }
            };

            List<SectionPermission> permissionList = new List<SectionPermission>();

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetSectionPermissions", paramDic);

                foreach (DataRow row in dataTable.Rows)
                {
                    SectionPermission permission = new SectionPermission
                    {
                        PermissionId = Convert.ToInt32(row["PremisionId"]),
                        SectionID = Convert.ToInt32(row["SectionID"]),
                        ResponsiblePerson = row["ResponsiblePerson"].ToString(),
                        CanView = Convert.ToBoolean(row["CanView"]),
                        CanEdit = Convert.ToBoolean(row["CanEdit"]),
                        CanEvaluate = Convert.ToBoolean(row["CanEvaluate"])
                    };
                    permissionList.Add(permission);
                }

                return permissionList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public SectionPermission GetPermissionById(int permissionId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PermissionId", permissionId }
            };

            try
            {
                DataTable dataTable =  ExecuteQuery("spGetPermissionById", paramDic);
                SectionPermission permission = null;
                    DataRow row = dataTable.Rows[0];

                if (dataTable.Rows.Count > 0)
                
                {
                    permission = new SectionPermission
                    {
                        PermissionId = Convert.ToInt32(row["PremisionId"]),
                        SectionID = Convert.ToInt32(row["SectionID"]),
                        ResponsiblePerson = row["ResponsiblePerson"].ToString(),
                        CanView = Convert.ToBoolean(row["CanView"]),
                        CanEdit = Convert.ToBoolean(row["CanEdit"]),
                        CanEvaluate = Convert.ToBoolean(row["CanEvaluate"])
                    };
                }

                return permission;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int AddSectionPermission(SectionPermission permission)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@SectionId", permission.SectionID },
                { "@ResponsiblePerson", permission.ResponsiblePerson },
                { "@CanView", permission.CanView },
                { "@CanEdit", permission.CanEdit },
                { "@CanEvaluate", permission.CanEvaluate }
            };

            try
            {
                int permissionId = Convert.ToInt32(ExecuteScalar("spAddSectionPermission", paramDic));
                return permissionId;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int UpdateSectionPermission(SectionPermission permission)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PermissionId", permission.PermissionId },
                { "@CanView", permission.CanView },
                { "@CanEdit", permission.CanEdit },
                { "@CanEvaluate", permission.CanEvaluate }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spUpdateSectionPermission", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int DeleteSectionPermission(int permissionId)
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PermissionId", permissionId }
            };

            try
            {
                int numAffected = ExecuteNonQuery("spDeleteSectionPermission", paramDic);
                return numAffected;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}