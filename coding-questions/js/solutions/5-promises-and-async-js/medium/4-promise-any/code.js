const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("server 1 responded");
  }, 2000);
});

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject("server 2 rejected");
  }, 1000);
});

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("server 3 responded");
  }, 1500);
});

const result = await Promise.any([p1, p2, p3]);

console.log(result);

/* Output:

server 3 responded

*/
