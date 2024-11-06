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
    public class DepartmentViewModel
    {
        private readonly DepartmentDAO _dao;

        public int Id { get; set; }
        public string? DepartmentName { get; set; }
        public string? Timer { get; set; }

        public DepartmentViewModel()
        {
            _dao = new DepartmentDAO();
        }

        // Retrieve all Departments as ViewModel instances
        public async Task<List<DepartmentViewModel>> GetAll()
        {
            List<DepartmentViewModel> allVms = new();
            try
            {
                List<Department> allDepartments = await _dao.GetAll();
                foreach (Department dept in allDepartments)
                {
                    DepartmentViewModel deptVm = new()
                    {
                        Id = dept.Id,
                        DepartmentName = dept.DepartmentName,
                        Timer = Convert.ToBase64String(dept.Timer!) // Binary to base64 for the Timer field
                    };
                    allVms.Add(deptVm);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return allVms;
        }
    }
}
