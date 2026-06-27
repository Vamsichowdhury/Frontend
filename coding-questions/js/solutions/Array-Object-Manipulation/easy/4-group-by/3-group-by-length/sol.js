/*
Group strings by their length.
Input: ['a', 'ab', 'abc', 'de', 'fgh', 'ijk', 'lmn', 'opqrs']
Output:
{
  1: ['a'],
  2: ['ab', 'de'],
  3: ['abc', 'fgh', 'ijk', 'lmn'],
  5: ['opqrs']
}
*/

// with out reduce
function groupByLength(arr) {
  const result = {};
  for (const str of arr) {
    const length = str.length;
    if (!result[length]) {
      result[length] = [];
    }
    result[length].push(str);
  }
  return result;
}

console.log(
  groupByLength(["a", "ab", "abc", "de", "fgh", "ijk", "lmn", "opqrs"]),
);
