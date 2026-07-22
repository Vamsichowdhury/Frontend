const p1 = new Promise((resolve, reject) =>
  setTimeout(() => {
    resolve("Promise 1 resolved");
  }, 1000),
);

const p2 = new Promise((resolve, reject) =>
  setTimeout(() => {
    resolve("Promise 2 resolved");
  }, 2000),
);

const p3 = new Promise((resolve, reject) =>
  setTimeout(() => {
    reject("Promise 3 rejected");
  }, 1500),
);

const result = await Promise.allSettled([p1, p2, p3]);

console.log(result);
/*
 Output:
 
 [
   { status: 'fulfilled', value: 'Promise 1 resolved' },
   { status: 'fulfilled', value: 'Promise 2 resolved' },
   { status: 'rejected', reason: 'Promise 3 rejected' }
 ]

*/
