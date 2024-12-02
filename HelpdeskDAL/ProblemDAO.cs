using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HelpdeskDAL
{
    public class ProblemDAO
    {
        readonly IRepository<Problem> _repo;
        public ProblemDAO()
        {
            _repo = new HelpdeskRepository<Problem>();
        }

        public async Task<Problem?> GetByDescription(string description)
        {
            Problem? selectedProblem;
            try
            {
                selectedProblem = await _repo.GetOne(prob => prob.Description == description);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedProblem;
        }

        public async Task<List<Problem>> GetAll()
        {
            List<Problem> problems = new List<Problem>();
            try
            {
                problems = await _repo.GetAll();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return problems;
        }
        public async Task<int> Add(Problem newProblem)
        {
            try
            {
                await _repo.Add(newProblem);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return newProblem.Id;
        }

        public async Task<Problem> GetById(int Id)
        {
            Problem? selectedProblem;
            try
            {
                selectedProblem = await _repo.GetOne(prb => prb.Id == Id);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedProblem!;
        }
    }
}
