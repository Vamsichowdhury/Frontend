/*
what is an anagram?

An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once. 

For example, the word "listen" can be rearranged to form the word "silent".
*/

import { useState } from "react";

export default function AnagramChecker() {
  const [firstString, setFirstString] = useState("");
  const [secondString, setSecondString] = useState("");
  const [isAnagram, setIsAnagram] = useState(false);

  const checkStatus = () => {
    const sortedS1 = firstString.toLocaleLowerCase().split("").sort().join("");
    const sortedS2 = secondString.toLocaleLowerCase().split("").sort().join("");
    if (sortedS1 === sortedS2) {
      setIsAnagram(true);
    } else {
      setIsAnagram(false);
    }
  };

  return (
    <>
      <h2>AnagramChecker</h2>
      <h3>What is an anagram?</h3>
      <p>
        An anagram is a word or phrase formed by rearranging the letters of a
        different word or phrase, typically using all the original letters
        exactly once. For example, the word "listen" can be rearranged to form
        the word "silent".
      </p>
      <br />
      <input
        type="text"
        placeholder="text 1"
        onChange={(e) => setFirstString(e.target.value)}
        value={firstString}
      />
      <input
        type="text"
        placeholder="text 2"
        onChange={(e) => setSecondString(e.target.value)}
        value={secondString}
      />
      <button onClick={checkStatus}>check</button>
      {isAnagram ? "Anagram" : "Not Anagram"}
    </>
  );
}
