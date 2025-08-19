namespace FinalProject.DAL.Models
{
    public class FieldAnswerInstance
    {
        public int InstanceId { get; set; }
        public int FieldID { get; set; }
        public string Answer { get; set; }
        public DateTime? AnswerDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}