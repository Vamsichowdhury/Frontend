/**
 * @param {string} s
 * @return {number}
 */
var firstUniqChar = function (s) {
  const freq = {};
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    freq[char] = (freq[char] || 0) + 1;
  }
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (freq[char] === 1) {
      return i;
    }
  }
  return -1;
};
