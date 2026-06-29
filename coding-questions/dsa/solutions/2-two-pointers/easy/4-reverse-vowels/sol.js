/*
Input: s = "IceCreAm"

Output: "AceCreIm"

*/

var reverseVowels = function (s) {
  const vowels = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"];
  let result = "";
  const extractedVowels = [];
  for (const char of s) {
    if (vowels.includes(char)) {
      extractedVowels.push(char);
    }
  }
  for (let i = 0; i < s.length; i++) {
    if (vowels.includes(s[i])) {
      const lastVowel = extractedVowels.pop();
      result += lastVowel;
    } else {
      result += s[i];
    }
  }
  return result;
};

var reverseVowels = function (s) {
  const vowels = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"];
  const ss = s.split("");
  let l = 0,
    r = s.length - 1;

  while (l < r) {
    if (vowels.includes(ss[l]) && vowels.includes(ss[r])) {
      [ss[l], ss[r]] = [ss[r], ss[l]];
      l++;
      r--;
    } else if (!vowels.includes(ss[l])) {
      l++;
    } else {
      r--;
    }
  }
  return ss.join("");
};
console.log(reverseVowels("IceCreAm")); // Output: "AceCreIm"
