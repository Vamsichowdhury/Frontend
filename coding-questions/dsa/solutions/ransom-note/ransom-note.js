/**
 * @param {string} ransomNote
 * @param {string} magazine
 * @return {boolean}
 */
var canConstruct = function (ransomNote, magazine) {
  const magFrequenciesMap = new Map();
  for (let i = 0; i < magazine.length; i++) {
    if (magFrequenciesMap.has(magazine[i])) {
      magFrequenciesMap.set(
        magazine[i],
        magFrequenciesMap.get(magazine[i]) + 1,
      );
    } else {
      magFrequenciesMap.set(magazine[i], 1);
    }
  }

  for (let i = 0; i < ransomNote.length; i++) {
    if (magFrequenciesMap.has(ransomNote[i])) {
      magFrequenciesMap.set(
        ransomNote[i],
        magFrequenciesMap.get(ransomNote[i]) - 1,
      );
    } else {
      return false;
    }
    if (magFrequenciesMap.get(ransomNote[i]) < 0) {
      return false;
    }
  }
  return true;
};
