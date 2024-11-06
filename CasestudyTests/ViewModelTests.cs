using HelpdeskViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CasestudyTests
{
    public class ViewModelTests
    {
        
        [Fact]
        public async Task EmployeeVM_Add()
        {
            EmployeeViewModel vm;
            vm = new()
            {
                Title = "Mr.",
                Firstname = "Omar",
                Lastname = "Alkhamissi",
                Email = "oa@abc.com",
                Phoneno = "(777)777-7777",
                DepartmentId = 100 
            };
            await vm.Add();
            Assert.True(vm.Id > 0);
        }

        [Fact]
        public async Task EmployeeVM_Delete()
        {
            EmployeeViewModel vm = new() { Lastname = "Alkhamissi" };
            await vm.GetByLastname();
            Assert.True(await vm.Delete() == 1);
        }

        [Fact]
        public async Task EmployeeVM_GetAll()
        {
            List<EmployeeViewModel> allEmployeeVms;
            EmployeeViewModel vm = new();
            allEmployeeVms = await vm.GetAll();
            Assert.True(allEmployeeVms.Count > 0);
        }

        [Fact]
        public async Task EmployeeVM_GetByEmailTest()
        {
            EmployeeViewModel vm = new() { Email = "bs@abc.com" };
            await vm.GetByEmail("bs@abc.com");
            Assert.NotNull(vm.Firstname);
        }
        [Fact]
        public async Task EmployeeVM_GetById()
        {
            EmployeeViewModel vm = new() { Id = 11 };
            await vm.GetById();
        }

        [Fact]
        public async Task EmployeeVM_GetByPhone()
        {
            EmployeeViewModel vm = new() { Phoneno = "(777)777-7777" };
            await vm.GetByPhoneNumber();
            Assert.NotNull(vm.Firstname);
        }
        [Fact]
        public async Task EmployeeViewModel_Update()
        {
            EmployeeViewModel vm = new() { Lastname = "Alkhamissi" };
            await vm.GetByLastname();
            vm.Email = vm.Email == "oa@abc.com" ? "jd@abc.com" : "oa@abc.com";
            Assert.True(await vm.Update() == 1);
        }
    }
}
