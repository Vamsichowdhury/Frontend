function chunkSize(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Example usage:
const arr = [1, 2, 3, 4, 5, 6, 7, 8];
const chunkedArr = chunkSize(arr, 3);
console.log(chunkedArr); // Output: [[1, 2, 3], [4, 5, 6], [7, 8]]
