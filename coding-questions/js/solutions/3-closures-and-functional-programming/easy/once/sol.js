/*
## Example

function greet(name) {
  return `Hello ${name}`;
}

const greetOnce = once((name)=> `Hello ${name}`);
console.log(greetOnce("Vamsi")); // Hello Vamsi
console.log(greetOnce("John"));  // undefined
console.log(greetOnce("Alex"));  // undefined
*/

function once(fn) {
  let called = false;
  return function (...args) {
    if (called) return undefined;
    called = true;
    return fn(...args);
  };
}
