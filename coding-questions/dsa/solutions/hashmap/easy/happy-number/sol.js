var isHappy = function (n, seen = {}) {
  if (n < 0) return false;

  if (seen[n]) return false;

  seen[n] = "seen";

  let sum = 0;
  while (n > 0) {
    const last = n % 10;
    sum += last * last;
    n = Math.floor(n / 10);
  }
  if (sum === 1) {
    return true;
  } else {
    return isHappy(sum, seen);
  }
};
