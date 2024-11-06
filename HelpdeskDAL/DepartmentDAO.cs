using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpdeskDAL
{
    public class DepartmentDAO
    {
        private readonly HelpdeskContext _context;

        public DepartmentDAO()
        {
            _context = new HelpdeskContext(); // Ensure SchoolContext is properly configured
        }

        public async Task<List<Department>> GetAll()
        {
            return await _context.Departments.ToListAsync();
        }
    }
}