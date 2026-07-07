/*
Group employees based on department.
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
  HR: [
    { name: 'Alice', department: 'HR' },
    { name: 'Charlie', department: 'HR' }
  ],
  Engineering: [
    { name: 'Bob', department: 'Engineering' },
    { name: 'David', department: 'Engineering' }
  ],
  Sales: [
    { name: 'Eve', department: 'Sales' }
  ]
}
*/
// with out reduce
function groupByDept(arr) {
  const result = {};
  for (const emp of arr) {
    const dept = emp.department;
    if (!result[dept]) {
      result[dept] = [];
    }
    result[dept].push(emp);
  }
  return result;
}

console.log(
  groupByDept([
    { name: "Alice", department: "HR" },
    { name: "Bob", department: "Engineering" },
    { name: "Charlie", department: "HR" },
    { name: "David", department: "Engineering" },
    { name: "Eve", department: "Sales" },
  ]),
);
