using HelpdeskDAL;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HelpdeskViewModels
{
    public class ProblemViewModel
    {
        readonly ProblemDAO _dao;

        public int Id { get; set; }
        public string? Description { get; set; }

        public ProblemViewModel()
        {
            _dao = new ProblemDAO();
        }

        public async Task<ProblemViewModel?> GetByDescription(string description)
        {
            try
            {
                var problem = await _dao.GetByDescription(description);
                if (problem == null) return null;

                return new ProblemViewModel
                {
                    Id = problem.Id,
                    Description = problem.Description
                };
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
        }

        public async Task<List<ProblemViewModel>> GetAll()
        {
            try
            {
                var problems = await _dao.GetAll();
                return problems.Select(prob => new ProblemViewModel
                {
                    Id = prob.Id,
                    Description = prob.Description
                }).ToList();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
        }
    }
}