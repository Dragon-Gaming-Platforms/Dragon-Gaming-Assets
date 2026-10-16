let a = [];
for (let i = 0; i < 50; i++) {
  a.push(i);
}

let remainder = [];
for (let i = 0; i < 50; i++) {
  remainder.push(i % 6);
}

// console.log(remainder);
let b = [];
function noname() {
  if (b) {
    return typeof b;
  }
}

console.log(a);
const total = a.reduce((acc, val) => acc + val, 0);
console.log(total);
