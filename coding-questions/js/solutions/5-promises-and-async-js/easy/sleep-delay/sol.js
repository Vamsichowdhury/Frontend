async function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms),
  );
}
async function main() {
  console.log("Starting the sleep function...");
  await sleep(2000);
  console.log("This will be printed after 2 seconds.");
}
main();
