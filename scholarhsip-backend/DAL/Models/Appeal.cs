namespace FinalProject.DAL.Models
{
    public class Appeal
    {
        public int AppealID { get; set; }
        public int InstanceId { get; set; }
        public string AppealReason { get; set; }
        public DateTime AppealDate { get; set; }
        public string AppealStatus { get; set; } // Pending, Approved, Rejected
        public string ReviewerResponse { get; set; }
        public DateTime? ReviewDate { get; set; }
        public string ReviewedBy { get; set; }

        // Navigation properties (אופציונלי)
        public FormInstance FormInstance { get; set; }
        public Person Reviewer { get; set; }
    }
}