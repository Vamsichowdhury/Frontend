function closureCounter() {
  let count = 0;

  return function () {
    return count++;
  };
}

const counter = closureCounter();
console.log(counter()); // 0
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
