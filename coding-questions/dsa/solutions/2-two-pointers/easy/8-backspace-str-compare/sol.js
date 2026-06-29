/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var backspaceCompare = function (s, t) {
  const s1 = [];
  const t1 = [];
  for (char of s) {
    if (char === "#") {
      s1.pop();
    } else {
      s1.push(char);
    }
  }
  for (char of t) {
    if (char === "#") {
      t1.pop();
    } else {
      t1.push(char);
    }
  }
  if (s1.join() === t1.join()) return true;
  return false;
};

var backspaceCompare = function (s, t) {
  const process = (str) => {
    const stack = [];

    for (const char of str) {
      if (char === "#") {
        stack.pop();
      } else {
        stack.push(char);
      }
    }

    return stack.join("");
  };

  return process(s) === process(t);
};
var backspaceCompare = function (s, t) {
  const s1 = [];
  const t1 = [];

  const maxLen = Math.max(s.length, t.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < s.length) {
      if (s[i] === "#") s1.pop();
      else s1.push(s[i]);
    }

    if (i < t.length) {
      if (t[i] === "#") t1.pop();
      else t1.push(t[i]);
    }
  }

  return s1.join("") === t1.join("");
};
