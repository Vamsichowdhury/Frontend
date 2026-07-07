/*
Implement lodash’s groupBy.

syntax: groupBy(collection, iteratee)
Returns: Returns the composed aggregate object.


collection: The collection to iterate over. eg: array or object
iteratee: The function invoked per iteration. eg: (item) => item.city

========================================================================================================================
eg: array of objects
========================================================================================================================

const users = [
  { name: 'Alice', city: 'New York' },
  { name: 'Bob', city: 'Los Angeles' },
  { name: 'Charlie', city: 'New York' },
  { name: 'David', city: 'Los Angeles' },
  { name: 'Eve', city: 'Chicago' }
];

const groupedUsers = groupBy(users, item => item.city);

console.log(groupedUsers);

Output:
{
  "New York": [
    { name: 'Alice', city: 'New York' },
    { name: 'Charlie', city: 'New York' }
  ],
  "Los Angeles": [
    { name: 'Bob', city: 'Los Angeles' },
    { name: 'David', city: 'Los Angeles' }
  ],
  "Chicago": [
    { name: 'Eve', city: 'Chicago' }
  ]
}
========================================================================================================================
eg: array of numbers
========================================================================================================================

const numbers = [1, 2, 3, 4, 5, 6];

const groupedNumbers = groupBy(numbers, num => (num % 2 === 0 ? 'even' : 'odd'));

console.log(groupedNumbers);

Output:
{
  "even": [2, 4, 6],
  "odd": [1, 3, 5]
}
========================================================================================================================
eg: object of objects
========================================================================================================================


const users = {
  user1: { name: 'Alice', city: 'New York' },
  user2: { name: 'Bob', city: 'Los Angeles' },
  user3: { name: 'Charlie', city: 'New York' },
  user4: { name: 'David', city: 'Los Angeles' },
  user5: { name: 'Eve', city: 'Chicago' }
};

const groupedUsers = groupBy(users, item => item.city);

console.log(groupedUsers);

Output:
{
  "New York": {
    user1: { name: 'Alice', city: 'New York' },
    user3: { name: 'Charlie', city: 'New York' }
  },
  "Los Angeles": {
    user2: { name: 'Bob', city: 'Los Angeles' },
    user4: { name: 'David', city: 'Los Angeles' }
  },
  "Chicago": {
    user5: { name: 'Eve', city: 'Chicago' }
  }
}
========================================================================================================================
eg: object of numbers
========================================================================================================================



const numbers = {
  num1: 1,
  num2: 2,
  num3: 3,
  num4: 4,
  num5: 5,
  num6: 6
};

const groupedNumbers = groupBy(numbers, num => (num % 2 === 0 ? 'even' : 'odd'));

console.log(groupedNumbers);

Output:
{
  "even": {
    num2: 2,
    num4: 4,
    num6: 6
  },
  "odd": {
    num1: 1,
    num3: 3,
    num5: 5
  }
}   

*/

function groupBy(collection, iteratee) {
  const result = {};

  for (const key in collection) {
    const item = collection[key]; // Get the current item from the collection
    const groupKey = iteratee(item); // Apply the iteratee function to determine the group key

    if (!result[groupKey]) {
      result[groupKey] = Array.isArray(collection) ? [] : {};
    }

    if (Array.isArray(collection)) {
      result[groupKey].push(item);
    } else {
      result[groupKey][key] = item;
    }
  }

  return result;
}
