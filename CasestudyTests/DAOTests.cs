using HelpdeskDAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CasestudyTests
{
    public class DAOTests
    {
        [Fact]
        public async Task Employee_GetByEmailTest()
        {
            EmployeeDAO _db = new();
            Employee selectedEmployee = await _db.GetByEmail("bs@abc.com");
            Assert.NotNull(selectedEmployee);
        }
        [Fact]
        public async Task Employee_GetByLastnameTest()
        {
            EmployeeDAO dao = new();
            Employee selectedEmployee = await dao.GetByLastname("Pincher");
            Assert.NotNull(selectedEmployee);
        }

        [Fact]
        public async Task Employee_GetByPhoneNo()
        {
            EmployeeDAO dao = new();
            Employee selectedEmployee = await dao.GetByPhoneNumber("(555)555-1234");
            Assert.NotNull(selectedEmployee);
        }

        [Fact]
        public async Task Employee_GetByID()
        {
            EmployeeDAO dao = new();
            Employee selectedEmployee = await dao.GetByID(1);
            Assert.NotNull(selectedEmployee);
        }

        [Fact]
        public async Task GetAllTest()
        {
            EmployeeDAO dao = new();
            List<Employee> allEmployees = await dao.GetAll();
            Assert.True(allEmployees.Count > 0);
        }

        [Fact]
        public async Task Employee_AddTest()
        {
            HelpdeskContext _db = new();
            Employee newEmployee = new()
            {
                FirstName = "John",
                LastName = "Doe",
                PhoneNo = "(555)555-1234",
                Title = "Mr.",
                DepartmentId = 100,
                Email = "jd@someschool.com"
            };
            await _db.Employees.AddAsync(newEmployee);
            await _db.SaveChangesAsync();
            Assert.True(newEmployee.Id > 0);
        }

        [Fact]
        public async Task Employee_UpdateTest()
        {
            EmployeeDAO dao = new();
            Employee? studentForUpdate = await dao.GetByLastname("Doe");
            if (studentForUpdate != null)
            {
                string oldPhoneNo = studentForUpdate.PhoneNo!;
                string newPhoneNo = oldPhoneNo == "519-555-1234" ? "555-555-5555" : "519-555-1234";
                studentForUpdate!.PhoneNo = newPhoneNo;
            }
            Assert.True(await dao.Update(studentForUpdate!) == UpdateStatus.Ok);
        }

        [Fact]
        public async Task Employee_ConcurrencyTest()
        {
            EmployeeDAO dao1 = new();
            EmployeeDAO dao2 = new();
            Employee employeeForUpdate1 = await dao1.GetByLastname("Pincher");
            Employee employeeForUpdate2 = await dao2.GetByLastname("Pincher");
            if (employeeForUpdate1 != null)
            {
                string? oldPhoneNo = employeeForUpdate1.PhoneNo;
                string? newPhoneNo = oldPhoneNo == "519-555-1234" ? "555-555-5555" : "519-555-1234";
                employeeForUpdate1.PhoneNo = newPhoneNo;
                if (await dao1.Update(employeeForUpdate1) == UpdateStatus.Ok)
                {
                    // need to change the phone # to something else
                    employeeForUpdate2.PhoneNo = "666-666-6668";
                    Assert.True(await dao2.Update(employeeForUpdate2) == UpdateStatus.Stale);
                }
                else
                    Assert.True(false); // first update failed
            }
            else
                Assert.True(false); // didn't find student 1
        }

        [Fact]
        public async Task DeleteTest()
        {
            HelpdeskContext _db = new();
            Employee? selectedEmployee = await _db.Employees.FirstOrDefaultAsync(emp => emp.FirstName == "John" && emp.LastName == "Doe");
            if (selectedEmployee != null)
            {
                _db.Employees.Remove(selectedEmployee);
                Assert.True(await _db.SaveChangesAsync() == 1);
            }
            else
            {
                Assert.True(false);
            }
        }
    }
   
}

