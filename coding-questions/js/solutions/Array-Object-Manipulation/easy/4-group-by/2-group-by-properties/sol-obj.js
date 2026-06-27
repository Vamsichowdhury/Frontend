/*
Group employees based on department.

object of objects
Input:
[
  { name: 'Alice', department: 'HR' },
  { name: 'Bob', department: 'Engineering' },
  { name: 'Charlie', department: 'HR' },
  { name: 'David', department: 'Engineering' },
  { name: 'Eve', department: 'Sales' }
]

Output:
{
  HR: {
    Alice: { name: 'Alice', department: 'HR' },
    Charlie: { name: 'Charlie', department: 'HR' }
  },
  Engineering: {
    Bob: { name: 'Bob', department: 'Engineering' },
    David: { name: 'David', department: 'Engineering' }
  },
  Sales: {
    Eve: { name: 'Eve', department: 'Sales' }
  }
}
*/
// with out reduce
function groupByDeptObj(arr) {
  const result = {};
  for (const emp of arr) {
    const dept = emp.department;
    if (!result[dept]) {
      result[dept] = {};
    }
    result[dept][emp.name] = emp;
  }
  return result;
}
