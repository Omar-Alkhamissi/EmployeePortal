using System;
using System.Collections.Generic;

namespace HelpdeskDAL;

public partial class Problem : EmployeeEntity
{

    public string? Description { get; set; }

    public virtual ICollection<Call> Calls { get; set; } = new List<Call>();
}
