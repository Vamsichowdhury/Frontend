/**
 * @param {number[]} digits
 * @return {number[]}
 */
var plusOne = function (digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }
  const newNum = Array(digits.length + 1).fill(0);
  newNum[0] = 1;
  return newNum;
};

/*
    998 if you encounter a number <9, increment it and return entire number
    999

    999 if you encounter 9 make it 0 and continue doing the same and at last add 1 
   1000

    989 if you encounter 9 make it 0 and continue and if <9 increment and return entire num
    990
*/
