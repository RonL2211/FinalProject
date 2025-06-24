using System;

namespace FinalProject.DAL.Models
{
    public class FormSubSection
    {
        public int SubSectionID { get; set; }
        public int SectionID { get; set; }
        public int FormID { get; set; }
        public string Title { get; set; }
        public string Explanation { get; set; }
        public decimal? MaxPoints { get; set; }
        public bool IsRequired { get; set; }

        
    }
}