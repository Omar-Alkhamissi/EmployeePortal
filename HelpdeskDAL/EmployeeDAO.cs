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
    public class EmployeeDAO
    {
        readonly IRepository<Employee> _repo;
        public EmployeeDAO()
        {
            _repo = new HelpdeskRepository<Employee>();
        }

        public async Task<Employee?> GetByLastname(string name)
        {
            Employee? selectedEmployee;
            try
            {
                Debug.WriteLine($"Searching for employee with LastName: {name}");
                selectedEmployee = await _repo.GetOne(emp => emp.LastName == name);
                if (selectedEmployee == null)
                {
                    Debug.WriteLine($"No employee found with LastName: {name}");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()!.Name}: {ex.Message}");
                throw;
            }
            return selectedEmployee;
        }


        public async Task<Employee> GetByEmail(string Email)
        {
            Employee? selectedEmployee;
            try
            {
                selectedEmployee = await _repo.GetOne(emp => emp.Email ==
               Email);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedEmployee!;
        }

        public async Task<Employee> GetById(int Id)
        {
            Employee? selectedEmployee;
            try
            {
                selectedEmployee = await _repo.GetOne(emp => emp.Id ==
               Id);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedEmployee!;
        }

        public async Task<List<Employee>> GetAll()
        {
            List<Employee> selectedEmployee = new List<Employee>();
            try
            {

                selectedEmployee = await _repo.GetAll();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedEmployee;
        }

        public async Task<Employee> GetByPhone(string Phone)
        {
            Employee? selectedEmployee;
            try
            {
                selectedEmployee = await _repo.GetOne(emp => emp.PhoneNo ==
               Phone);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedEmployee!;
        }

        public async Task<int> Add(Employee newEmployee)
        {
            var existingEmployee = await _repo.GetOne(emp => emp.LastName == newEmployee.LastName);
            if (existingEmployee != null)
            {
                throw new InvalidOperationException("An employee with this lastname already exists.");
            }
            try
            {
                await _repo.Add(newEmployee);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return newEmployee.Id;
        }

        public async Task<UpdateStatus> Update(Employee updatedEmployee)
        {
            UpdateStatus status;

            status = await _repo.Update(updatedEmployee);

            return status;
        }


        public async Task<int> Delete(int? id)
        {

            int employeeDeleted;
            try
            {
                employeeDeleted = await _repo.Delete((int)id!);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return employeeDeleted;
        }

    }
}
