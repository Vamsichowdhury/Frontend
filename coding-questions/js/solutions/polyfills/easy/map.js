const arr = [1, 2, 3, 4, 5];

function modifyArray(item) {
  return item * 2;
}
const newArr = arr.map(modifyArray);
console.log(newArr);

/*
in arr.map, map is a function that takes a callback function as an argument. The callback function is executed for each element in the array, and the return value of the callback function is used to create a new array. In this case, the modifyArray function is passed as the callback function, which multiplies each element by 2 and returns the result. The newArr variable will contain the new array with the modified values.

map is attached to the array.prototype, which means that it is a method that can be called on any array.
*/

// attaching myMap to the array.prototype, here myMap is similar to the Array.prototype.map function
Array.prototype.myMap = function (callback) {
  const newArray = []; // create a new array to store the modified values
  const arr = this; // this refers to the array on which the myMap function is called
  for (let i = 0; i < arr.length; i++) {
    newArray.push(callback(arr[i], i, arr)); //
  }
  return newArray;
};

const result = arr.myMap(modifyArray); // similar to : const result = someFuncName(), basically we are calling a myMap function which is attached to the array.prototype
console.log(result); // [2, 4, 6, 8, 10]

// arr.myMap or arr.map() is like accessing a function of an object

const obj = {
  name: "John",
  age: 30,
  greet: function () {
    console.log(
      `Hello, my name is ${this.name} and I am ${this.age} years old.`,
    );
  },
};

obj.greet(); // here obj.greet() is similar to arr.map() or arr.myMap(), we are accessing a function of an object. In this case, the greet function is a method of the obj object, and it uses the this keyword to refer to the obj object itself. When we call obj.greet(), it logs a message to the console that includes the name and age properties of the obj object.
