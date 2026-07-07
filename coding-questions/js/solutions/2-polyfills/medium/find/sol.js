const products = [
  {
    id: 1,
    name: "laptop",
  },
  {
    id: 2,
    name: "phone",
  },
  {
    id: 3,
    name: "tab",
  },
];

function getProduct(product) {
  return product.id === 2;
}

Array.prototype.myFind = function (callback) {
  let arr = this;
  for (let i = 0; i < arr.length; i++) {
    if (callback(arr[i], i, arr)) {
      return arr[i];
    }
  }
};

const result = products.myFind(getProduct);
console.log(result);
