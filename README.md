1) Difference between var, let, and const
var: The old way. It can be used anywhere in its function, which sometimes causes weird bugs.

let: The modern way when you know the value might change. It only works inside the block { } where you declare it.

const: Like let, but the value never changes. It’s fixed once you set it.



2) Difference between map(), forEach(), and filter()
forEach: Just loops through items. You usually use it to do something with each item (like printing to the console). It doesn’t return anything new.

map: Loops and makes a new array, where every item is changed in some way.

filter: Loops and returns a new array with only the items that match your condition.



3) Arrow functions in ES6
Arrow functions are just a shorter, cleaner way to write functions. They also handle the this keyword better, which makes code less confusing.

Example:

js
// Normal function
function sayHi(name) {
  return "Hello " + name;
}

// Arrow function
const sayHi = (name) => `Hello ${name}`;


4) Destructuring assignment in ES6
Destructuring is a fancy word for pulling values out of arrays and objects easily.

Example:

js
let [a, b] = [10, 20]; // a=10, b=20

let {name, age} = {name: "sakib", age: 25}; // name="sakib", age=25


5) Template literals in ES6
Template literals are strings made with backticks ` instead of quotes. The cool part is you can drop variables right inside using ${} without having to use +. They also let you write multi-line text easily.

Example:

js
let name = "sakib";
let age = 25;

// Old way
let text1 = "My name is " + name + " and I am " + age + " years old.";

// ES6 way
let text2 = `My name is ${name} and I am ${age} years old.`;