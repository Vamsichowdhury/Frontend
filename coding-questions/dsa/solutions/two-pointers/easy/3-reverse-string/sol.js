var reverseString = function (s) {
  const k = Math.floor(s.length / 2);
  let i = 0;
  let j = s.length - 1;
  while (i < k) {
    [s[i], s[j]] = [s[j], s[i]];
    i++;
    j--;
  }
};
