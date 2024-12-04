using HelpdeskViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Diagnostics;
using System.Reflection;
using HelpdeskWebsite.Reports;


namespace HelpdeskWebsite.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        public ReportController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpGet("employeereport")]
        public async Task<IActionResult> GetEmployeeReport()
        {
            // Retrieve Employee data
            EmployeeViewModel viewmodel = new();
            List<EmployeeViewModel> Employees = await viewmodel.GetAll();

            // Generate the report
            EmployeeReport employeeReport = new();
            await employeeReport.GenerateEmpReportAsync(_env.WebRootPath, Employees);

            return Ok(new { msg = "Report Generated" });
        }

        [HttpGet("callreport")]
        public async Task<IActionResult> GetCallReport()
        {
            try
            {
                // Retrieve call data
                CallViewModel callViewModel = new();
                List<CallViewModel> calls = await callViewModel.GetAll();

                // Generate the report
                CallReport callReport = new();
                await callReport.GenerateCallReportAsync(_env.WebRootPath, calls);

                // Return a success message
                return Ok(new { msg = "Call Report Generated Successfully" });
            }
            catch (Exception ex)
            {
                // Return an error message if something goes wrong
                return StatusCode(500, new { msg = "An error occurred while generating the report", error = ex.Message });
            }
        }

    }
}

