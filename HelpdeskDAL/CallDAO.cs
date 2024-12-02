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
    public class CallDAO
    {
        readonly IRepository<Call> _repo;

        public CallDAO()
        {
            _repo = new HelpdeskRepository<Call>();
        }

        public async Task<Call?> GetById(int id)
        {
            try
            {
                return await _repo.GetOne(call => call.Id == id); // Return null if the record does not exist
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()!.Name}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> Add(Call newCall)
        {
            try
            {
                await _repo.Add(newCall);
                return newCall.Id; // Ensure the ID of the newly added entity is returned
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()!.Name}: {ex.Message}");
                throw;
            }
        }


        public async Task<UpdateStatus> Update(Call updatedCall)
        {
            try
            {
                // Retrieve the existing call from the database
                var existingCall = await _repo.GetOne(c => c.Id == updatedCall.Id);
                if (existingCall == null) return UpdateStatus.Failed;

                // Check for concurrency (Timer mismatch)
                if (existingCall.Timer == null || updatedCall.Timer == null ||
                    !existingCall.Timer.SequenceEqual(updatedCall.Timer))
                {
                    return UpdateStatus.Stale;
                }

                // Update the properties
                existingCall.EmployeeId = updatedCall.EmployeeId;
                existingCall.ProblemId = updatedCall.ProblemId;
                existingCall.TechId = updatedCall.TechId;
                existingCall.DateOpened = updatedCall.DateOpened;
                existingCall.DateClosed = updatedCall.DateClosed;
                existingCall.OpenStatus = updatedCall.OpenStatus;
                existingCall.Notes = updatedCall.Notes;

                // Save changes
                return await _repo.Update(existingCall);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()?.Name}: {ex.Message}");
                throw;
            }
        }


        public async Task<int> Delete(int id)
        {
            try
            {
                return await _repo.Delete(id); // Ensure the entity is fully removed from the database
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name}.{MethodBase.GetCurrentMethod()!.Name}: {ex.Message}");
                throw;
            }
        }
    }
}
