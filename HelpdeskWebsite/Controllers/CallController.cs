using Microsoft.AspNetCore.Mvc;
using HelpdeskDAL;
using HelpdeskViewModels;
using System.Diagnostics;
using System.Reflection;
using HelpdeskWebsite.Reports;

namespace HelpdeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CallController : ControllerBase
    {
        private readonly CallViewModel _vm;

        public CallController()
        {
            _vm = new CallViewModel();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var calls = await _vm.GetAll();
                return Ok(calls);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CallViewModel call)
        {
            try
            {
                var id = await call.Add();
                return Ok(new { id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] CallViewModel call)
        {
            try
            {
                var status = await call.Update();
                return Ok(new { status });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                CallViewModel viewmodel = new() { Id = id };
                return await viewmodel.Delete() == 1
                ? Ok(new { msg = "Call " + id + " deleted!" })
               : Ok(new { msg = "Call " + id + " not deleted!" });
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError); // something went wrong
            }
        }
       

    }
}
