using HelpdeskDAL;
using HelpdeskViewModels;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit.Abstractions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CasestudyTests
{
    public class DAOTests
    {
        private readonly ITestOutputHelper output;
        public DAOTests(ITestOutputHelper output)
        {
            this.output = output;
        }

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

        //[Fact]
        //public async Task Employee_GetByPhoneNo()
        //{
        //    EmployeeDAO dao = new();
        //    Employee selectedEmployee = await dao.GetByPhoneNumber("(555)555-1234");
        //    Assert.NotNull(selectedEmployee);
        //}

        //[Fact]
        //public async Task Employee_GetByID()
        //{
        //    EmployeeDAO dao = new();
        //    Employee selectedEmployee = await dao.GetByID("");
        //    Assert.NotNull(selectedEmployee);
        //}

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

        [Fact]
        public async Task Employee_LoadPicsTest()
        {
            {
                PicsUtility util = new();
                Assert.True(await util.AddEmployeePicsToDb());
            }
        }

        [Fact]
        public async Task Employee_ComprehensiveTest()
        {
            EmployeeDAO dao = new();
            Employee newEmployee = new()
            {
                FirstName = "Joe",
                LastName = "Smith",
                PhoneNo = "(555)555-1234",
                Title = "Mr.",
                DepartmentId = 100,
                Email = "js@abc.com"
            };
            int newEmployeeId = await dao.Add(newEmployee);
            output.WriteLine("New Employee Generated - Id = " + newEmployeeId);
            newEmployee = await dao.GetById(newEmployeeId);
            byte[] oldtimer = newEmployee.Timer!;
            output.WriteLine("New Employee " + newEmployee.Id + " Retrieved");
            newEmployee.PhoneNo = "(555)555-1233";
            if (await dao.Update(newEmployee) == UpdateStatus.Ok)
            {
                output.WriteLine("Employee " + newEmployeeId + " phone# was updated to - " + newEmployee.PhoneNo);
            }
            else
            {
                output.WriteLine("Employee " + newEmployeeId + " phone# was not updated!");
            }
            newEmployee.Timer = oldtimer; // to simulate another user
            newEmployee.PhoneNo = "doesn't matter data is stale now";
            if (await dao.Update(newEmployee) == UpdateStatus.Stale)
            {
                output.WriteLine("Employee " + newEmployeeId + " was not updated due to stale data");
            }

            dao = new();
            await dao.GetById(newEmployeeId);
            if (await dao.Delete(newEmployeeId) == 1)
            {
                output.WriteLine("Employee " + newEmployeeId + " was deleted!");
            }
            else
            {
                output.WriteLine("Employee " + newEmployeeId + " was not deleted");
            }
            // should be null because it was just deleted
            Assert.Null(await dao.GetById(newEmployeeId));
        }

        [Fact]
        public async Task Employee_ComprehensiveVMTest()
        {
            EmployeeViewModel evm = new()
            {
                Title = "Mr.",
                Firstname = "Some",
                Lastname = "Employee",
                Email = "some@abc.com",
                Phoneno = "(777)777-7777",
                DepartmentId = 100 // ensure department id is in Departments table
            };
            await evm.Add();
            output.WriteLine("New Employee Added - Id = " + evm.Id);
            int? id = evm.Id; // need id for delete later
            await evm.GetById();
            output.WriteLine("New Employee " + id + " Retrieved");
            evm.Phoneno = "(555)555-1233";
            if (await evm.Update() == 1)
            {
                output.WriteLine("Employee " + id + " phone# was updated to - " +
               evm.Phoneno);
            }
            else
            {
                output.WriteLine("Employee " + id + " phone# was not updated!");
            }
            evm.Phoneno = "Another change that should not work";
            if (await evm.Update() == -2)
            {
                output.WriteLine("Employee " + id + " was not updated due to stale data");
            }
            evm = new EmployeeViewModel
            {
                Id = id
            };
            // need to reset because of concurrency error
            await evm.GetById();
            if (await evm.Delete() == 1)
            {
                output.WriteLine("Employee " + id + " was deleted!");
            }
            else
            {
                output.WriteLine("Employee " + id + " was not deleted");
            }
            // should throw expected exception
            Task<NullReferenceException> ex = Assert.ThrowsAsync<NullReferenceException>(async ()
           => await evm.GetById());
        }

        [Fact]
        public async Task Call_ComprehensiveTest()
        {
            CallDAO dao = new();
            EmployeeDAO employeeDao = new();
            ProblemDAO problemDao = new();

            // Fetch dynamic employee and technician data
            Employee problemEmployee = await employeeDao.GetByLastname("Alkhamissi") ?? throw new Exception("Problem employee not found.");
            Employee technician = await employeeDao.GetByLastname("Burner") ?? throw new Exception("Technician not found.");
            Problem problem = await problemDao.GetByDescription("Memory Upgrade") ?? throw new Exception("Problem not found.");

            if (problemEmployee == null) throw new Exception("Problem employee not found.");
            if (technician == null) throw new Exception("Technician not found.");
            if (problem == null) throw new Exception("Problem not found.");

            // Create a new call with dynamically fetched IDs
            Call newCall = new()
            {
                EmployeeId = problemEmployee.Id,
                ProblemId = problem.Id,
                TechId = technician.Id,
                DateOpened = DateTime.Now,
                DateClosed = null,
                OpenStatus = true,
                Notes = $"{problemEmployee.LastName} has bad RAM, {technician.LastName} to fix it."
            };

            // Add the call
            int newCallId = await dao.Add(newCall);
            output.WriteLine($"New Call Generated - Id = {newCallId}");

            // Retrieve the newly added call
            newCall = await dao.GetById(newCallId) ?? throw new Exception("Call Not found."); ;
            byte[] oldtimer = newCall.Timer!;
            output.WriteLine($"New Call Retrieved");

            // Fetch associated names dynamically (to confirm correctness)
            Employee fetchedEmployee = await employeeDao.GetById(newCall.EmployeeId);
            Employee fetchedTechnician = await employeeDao.GetById(newCall.TechId);
            Problem fetchedProblem = await problemDao.GetById(newCall.ProblemId);

            // Update the call with dynamic notes
            newCall.Notes = $"{fetchedEmployee.LastName}'s drive is shot, {fetchedTechnician.LastName} to fix it.";
            if (await dao.Update(newCall) == UpdateStatus.Ok)
            {
                output.WriteLine($"Call was updated {newCall.Notes}");
                output.WriteLine("Ordered new drive!");
            }
            else
            {
                output.WriteLine($"Call {newCallId} notes were not updated!");
            }

            // Simulate stale data update attempt
            newCall.Timer = oldtimer; // Stale timer
            newCall.Notes = "This update should fail due to stale data.";
            if (await dao.Update(newCall) == UpdateStatus.Stale)
            {
                output.WriteLine($"Call was not updated due to stale data");
            }

            // Delete the call
            dao = new CallDAO(); // Refresh DAO instance
            if (await dao.Delete(newCallId) == 1)
            {
                output.WriteLine($"Call was deleted!");
            }
            else
            {
                output.WriteLine($"Call was not deleted!");
            }

            // Assert the call is deleted
            Assert.Null(await dao.GetById(newCallId));
        }

        [Fact]
        public async Task Call_ComprehensiveVMTest()
        {
            EmployeeViewModel techVM = new()
            {
                Lastname = "Burner" 
            };
            EmployeeViewModel problemEmployeeVM = new()
            {
                Lastname = "Alkhamissi" 
            };


            // Retrieve the technician by last name
            await techVM.GetByLastname();
            int burnerId = techVM.Id ?? throw new Exception("Technician ID is null");
            string technicianName = $" {techVM.Lastname}";

           
            // Retrieve the employee by last name
            await problemEmployeeVM.GetByLastname();
            int Id = problemEmployeeVM.Id ?? throw new Exception("Employee ID is null");
            string problemEmployeeName = $"{problemEmployeeVM.Lastname}";

            // Set up ProblemViewModel
            ProblemViewModel problemVM = new();
            var problem = await problemVM.GetByDescription("Memory Upgrade");
            int problemId = problem?.Id ?? throw new Exception("Problem not found");

            // Set up CallViewModel
            CallViewModel cvm = new()
            {
                EmployeeId = Id,            
                ProblemId = problemId,           
                TechId = burnerId,  
                DateOpened = DateTime.Now,
                DateClosed = null,
                OpenStatus = true,
                Notes = $"{problemEmployeeName} has bad RAM, {technicianName} to fix it."
            };

            // Add the new Call
            await cvm.Add();
            output.WriteLine($"New Call Generated - Id = {cvm.Id}");

            int callId = cvm.Id;
            await cvm.GetById(callId);
            output.WriteLine("New Call Retrieved");

            // Update the Call
            cvm.Notes += "\nOrdered new RAM!";
            if (await cvm.Update() == UpdateStatus.Ok)
            {
                output.WriteLine($"Call was updated to - {cvm.Notes}");
            }
            else
            {
                output.WriteLine($"Call notes were not updated!");
            }

            // Simulate stale data by attempting an update with old data
            cvm.Notes = "This update should fail due to stale data.";
            if (await cvm.Update() == UpdateStatus.Stale)
            {
                output.WriteLine($"Call was not updated due to stale data");
            }

            // Reset the CallViewModel to simulate retrieving it again
            cvm = new CallViewModel
            {
                Id = callId
            };

            await cvm.GetById(callId);

            // Delete the Call
            if (await cvm.Delete() == 1)
            {
                output.WriteLine($"Call was deleted!");
            }
            else
            {
                output.WriteLine($"Call was not deleted!");
            }

            // Ensure the Call is deleted by checking for null
            var deletedCall = await cvm.GetById(callId);
            Assert.Null(deletedCall);
        }
    }

}

