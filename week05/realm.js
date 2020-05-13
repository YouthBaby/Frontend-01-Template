let objects = [
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "Array",
  "Date",
  "RegExp",
  "Promise",
  "Proxy",
  "Map",
  "WeakMap",
  "Set",
  "WeakSet",
  "Function",
  "Boolean",
  "String",
  "Number",
  "Symbol",
  "Object",
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "DataView",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Int16Array",
  "Int32Array",
  "Uint8Array",
  "Uint16Array",
  "Uint32Array",
  "Uint8ClampedArray",
  "Atomics",
  "JSON",
  "Math",
  "Reflect"
];

const set = new Set();

const globalObject = []

for (let i of objects) {
  globalObject.push({
    object: this[i],
    path: [i]
  })
}

while (globalObject.length) {
  const current = globalObject.shift();
  if (set.has(current.object))
    continue;
  set.add(current.object);

  let proto = Object.getPrototypeOf(current.object);
  if (proto) {
    globalObject.push({
      path: current.path.concat(["__proto__"]),
      object: proto
    });
  }

  for (let p of Object.getOwnPropertyNames(current.object)) {
    let d = Object.getOwnPropertyDescriptor(current.object, p);
    if (d.hasOwnProperty("value") && ((d.value !== null && typeof d.value === "object") || (typeof d.value === "function")) && d.value instanceof Object) {
      globalObject.push({
        path: current.path.concat([p]),
        object: d.value
      })
    }
    if (d.hasOwnProperty("get") && typeof d.get === "function") {
      globalObject.push({
        path: current.path.concat([p]),
        object: d.get
      });
    }
    if (d.hasOwnProperty("set") && typeof d.set === "function") {
      globalObject.push({
        path: current.path.concat([p]),
        object: d.set
      });
    }
  }
}
