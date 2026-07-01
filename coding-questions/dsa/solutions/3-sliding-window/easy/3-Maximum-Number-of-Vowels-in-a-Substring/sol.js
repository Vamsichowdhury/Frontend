var maxVowels = function (s, k) {
  const vowels = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"];
  let maxCount = -Infinity;
  for (let i = 0; i <= s.length - k; i++) {
    let count = 0;
    for (let j = i; j < i + k; j++) {
      if (vowels.includes(s[j])) {
        count += 1;
      }
    }
    maxCount = Math.max(maxCount, count);
  }
  return maxCount;
};
console.log(maxVowels("abciiidef", 3)); // Output: 3

// optimized
var maxVowels = function (s, k) {
  const vowels = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"];

  let count = 0;
  // first window count
  for (let i = 0; i < k; i++) {
    if (vowels.includes(s[i])) {
      count += 1;
    }
  }
  let maxCount = count;

  for (let i = k; i < s.length; i++) {
    // check if outgoing char is a vowel, if yes, reduce the count by 1
    if (vowels.includes(s[i - k])) count -= 1;

    // check if incoming char is a vowel, if yes, increase the count by 1
    if (vowels.includes(s[k])) count += 1;

    maxCount = Math.max(maxCount, count);
  }
  return maxCount;
};
