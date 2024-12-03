using HelpdeskDAL;
using System;
using System.Diagnostics;
using System.Reflection;
using System.Threading.Tasks;

namespace HelpdeskViewModels
{
    public class CallViewModel
    {
        readonly CallDAO _dao;

        public CallViewModel()
        {
            _dao = new CallDAO();
        }

        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int ProblemId { get; set; }
        public string? Notes { get; set; }
        public int TechId { get; set; }
        public DateTime DateOpened { get; set; }
        public DateTime? DateClosed { get; set; }
        public bool OpenStatus { get; set; }
        public string? Timer { get; set; }
        public string? EmployeeName { get; set; }
        public string? ProblemDescription { get; set; }
        public string? TechName { get; set; }

        public async Task<CallViewModel?> GetById(int id)
        {
            try
            {
                var call = await _dao.GetById(id);
                if (call == null) return null;

                // Map properties from DAO
                Id = call.Id;
                EmployeeId = call.EmployeeId;
                ProblemId = call.ProblemId;
                TechId = call.TechId;
                DateOpened = call.DateOpened;
                DateClosed = call.DateClosed;
                OpenStatus = call.OpenStatus;
                Notes = call.Notes;

                // Refresh Timer or set default
                Timer = call.Timer != null ? Convert.ToBase64String(call.Timer) : string.Empty;

                return this;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()?.Name}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<CallViewModel>> GetAll()
        {
            List<CallViewModel> allCalls = new();

            try
            {
                var calls = await _dao.GetAll();

                foreach (var call in calls)
                {
                    allCalls.Add(new CallViewModel
                    {
                        Id = call.Id,
                        EmployeeId = call.EmployeeId,
                        ProblemId = call.ProblemId,
                        TechId = call.TechId,
                        DateOpened = call.DateOpened,
                        DateClosed = call.DateClosed,
                        OpenStatus = call.OpenStatus,
                        Notes = call.Notes,
                        Timer = Convert.ToBase64String(call.Timer!),
                        EmployeeName = call.Employee != null ? $"{call.Employee.FirstName} {call.Employee.LastName}" : "Unknown",
                        ProblemDescription = call.Problem != null ? call.Problem.Description : "Unknown",
                        TechName = call.Tech != null ? $"{call.Tech.FirstName} {call.Tech.LastName}" : "Unknown"
                    });
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()?.Name}: {ex.Message}");
                throw;
            }

            return allCalls;
        }


        public async Task<int> Add()
        {
            try
            {
                var call = new Call
                {
                    EmployeeId = EmployeeId,
                    ProblemId = ProblemId,
                    TechId = TechId,
                    DateOpened = DateOpened,
                    DateClosed = DateClosed,
                    OpenStatus = OpenStatus,
                    Notes = Notes
                };

                int newId = await _dao.Add(call);
                Id = newId;
                return newId;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()!.Name}: {ex.Message}");
                throw;
            }
        }

        public async Task<UpdateStatus> Update()
        {
            try
            {
                var call = new Call
                {
                    Id = Id,
                    EmployeeId = EmployeeId,
                    ProblemId = ProblemId,
                    TechId = TechId,
                    DateOpened = DateOpened,
                    DateClosed = DateClosed,
                    OpenStatus = OpenStatus,
                    Notes = Notes,
                    Timer = Timer != null ? Convert.FromBase64String(Timer!) : null // Convert Timer back to byte array
                };

                return await _dao.Update(call);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()?.Name}: {ex.Message}");
                throw;
            }
        }


        public async Task<int> Delete()
        {
            try
            {
                return await _dao.Delete(Id);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()!.Name}: {ex.Message}");
                throw;
            }
        }
    } // Closing brace for the class

} // Closing brace for the namespace
