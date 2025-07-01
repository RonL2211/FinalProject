//using FinalProject.DAL.Models;
//using FinalProject.DAL.Repositories;
//using Microsoft.Extensions.Configuration;
//using System;
//using System.Collections.Generic;

//namespace FinalProject.BL.Services
//{
//    public class FormSubSectionService
//    {
//        private readonly FormSubSectionRepository _formSubSectionRepository;

//        public FormSubSectionService(IConfiguration configuration)
//        {
//            _formSubSectionRepository = new FormSubSectionRepository(configuration);
//        }

//        public List<FormSubSection> GetAllFormSubSections()
//        {
//            return _formSubSectionRepository.GetAllFormSubSections();
//        }

//        public FormSubSection GetFormSubSectionById(int subSectionId)
//        {
//            if (subSectionId <= 0)
//                throw new ArgumentException("SubSection ID must be greater than zero");

//            return _formSubSectionRepository.GetFormSubSectionById(subSectionId);
//        }

//        public List<FormSubSection> GetFormSubSectionsByFormId(int formId)
//        {
//            if (formId <= 0)
//                throw new ArgumentException("Form ID must be greater than zero");

//            return _formSubSectionRepository.GetFormSubSectionsByFormId(formId);
//        }

//        public List<FormSubSection> GetFormSubSectionsBySectionId(int sectionId)
//        {
//            if (sectionId <= 0)
//                throw new ArgumentException("Section ID must be greater than zero");

//            return _formSubSectionRepository.GetFormSubSectionsBySectionId(sectionId);
//        }

//        public int AddFormSubSection(FormSubSection subSection)
//        {
//            ValidateFormSubSection(subSection);
//            return _formSubSectionRepository.AddFormSubSection(subSection);
//        }

//        public int UpdateFormSubSection(FormSubSection subSection)
//        {
//            ValidateFormSubSection(subSection);

//            if (subSection.SubSectionID <= 0)
//                throw new ArgumentException("SubSection ID must be greater than zero for updates");

//            return _formSubSectionRepository.UpdateFormSubSection(subSection);
//        }

//        public int DeleteFormSubSection(int subSectionId)
//        {
//            if (subSectionId <= 0)
//                throw new ArgumentException("SubSection ID must be greater than zero");

//            return _formSubSectionRepository.DeleteFormSubSection(subSectionId);
//        }

//        private void ValidateFormSubSection(FormSubSection subSection)
//        {
//            if (subSection == null)
//                throw new ArgumentNullException(nameof(subSection), "FormSubSection cannot be null");

//            if (subSection.SectionID <= 0)
//                throw new ArgumentException("Section ID must be greater than zero");

//            if (subSection.FormID <= 0)
//                throw new ArgumentException("Form ID must be greater than zero");

//            if (string.IsNullOrEmpty(subSection.Title))
//                throw new ArgumentException("Title is required");

//            // Additional validation as needed
//        }
//    }
//}