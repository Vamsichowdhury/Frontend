# JavaScript Interview Question Bank (Curated)

### High-Value Conceptual Questions — Beginner to Expert

---

# 1. Variables, Data Types & Basics

1. What are the primitive data types in JavaScript?
2. Why does `typeof null` return `"object"`?
3. What is the difference between `var`, `let`, and `const`?
4. What is the Temporal Dead Zone?
5. What is the difference between `undefined` and `null`?
6. What are the falsy values in JavaScript?
7. How do you reliably check if a value is NaN?
8. What is the difference between primitive values and reference values?
9. What is the difference between `==` and `===`?
10. What is the difference between `Object.is()` and `===`?
11. What is a BigInt, and when would you use one?

---

# 2. Execution Context, Scope & Hoisting

12. What is an execution context, and what does it consist of?
13. What is the call stack?
14. What is lexical scoping and the scope chain?
15. What is hoisting, and how does it differ for `var`, `let`/`const`, and function declarations?
16. Why can you call a function declaration before it's defined, but not a function expression?
17. What is the difference between global, function, and block scope?
18. What is an IIFE, and why was it historically used?

---

# 3. Closures

19. What is a closure in JavaScript?
20. Why do closures still hold references after the outer function has returned?
21. Why does the classic `var` in a loop closure bug happen, and how does `let` fix it?
22. What are practical use cases of closures (e.g., data privacy, memoization)?
23. How can closures cause memory leaks?

---

# 4. Functions & Higher-Order Functions

24. What is a first-class function, and what is a higher-order function?
25. What is the difference between a function declaration and a function expression?
26. What are default parameters, and how do they interact with the `arguments` object?
27. Why doesn't an arrow function have its own `arguments` object?
28. What is currying, and how does it differ from partial application?
29. What is a pure function, and what are side effects?
30. What is the difference between `call`, `apply`, and `bind`?
31. What is memoization?
32. What is a generator function, and how does it differ from a regular function?

---

# 5. The `this` Keyword

33. What determines the value of `this` in JavaScript?
34. How does `this` behave differently in arrow functions vs regular functions?
35. What is the "lost `this`" problem, and when does it occur?
36. What is the value of `this` in strict mode vs non-strict mode for a standalone function call?
37. What happens to `this` when a class method is passed as a callback without binding?

---

# 6. Prototypes & Object-Oriented JavaScript

38. What is the prototype chain?
39. What is the difference between `__proto__` and `prototype`?
40. What is `Object.create()`?
41. What happens internally when you use the `new` keyword?
42. What is the difference between own properties and inherited properties?
43. Are ES6 classes just "syntactic sugar"? What's actually different under the hood?
44. What is the difference between static and instance methods?
45. What are private class fields?
46. What is the difference between composition and inheritance?
47. What is the purpose of `Object.freeze()` vs `Object.seal()`?
48. How do getters and setters work in objects and classes?

---

# 7. Objects & Arrays

49. What is the difference between a shallow copy and a deep copy?
50. What are common pitfalls of `JSON.parse(JSON.stringify(obj))` for cloning?
51. What is `structuredClone()`?
52. What is object/array destructuring, and what problem does it solve?
53. What is the difference between spread and rest syntax?
54. Why is `typeof []` `"object"`, and how do you reliably check for arrays?
55. What is the difference between `for...in` and `for...of`?
56. What is the conceptual difference between `map`, `forEach`, and `reduce`?
57. What are property descriptors (`writable`, `enumerable`, `configurable`)?

---

# 8. ES6+ Language Features

58. What are template literals, and what problem do they solve?
59. What is optional chaining (`?.`), and how does it change error-handling patterns?
60. What is the nullish coalescing operator (`??`), and how does it differ from `||`?
61. What are Symbols used for?
62. What is the significance of `Symbol.iterator`?
63. What is `Array.from()` used for?
64. What is the difference between named and default exports?

---

# 9. Iterators & Generators

65. What is an iterable vs an iterator?
66. What does the `yield` keyword do inside a generator?
67. What is the difference between `yield` and `yield*`?
68. What is the `for await...of` loop used for?

---

# 10. Asynchronous JavaScript

69. What is a Promise, and what are its three states?
70. What is Promise chaining, and how does it avoid callback hell?
71. What is the difference between `Promise.all()`, `Promise.allSettled()`, `Promise.race()`, and `Promise.any()`?
72. What happens if one Promise rejects inside `Promise.all()`?
73. How does `async`/`await` relate to Promises under the hood?
74. How does error handling differ between `.catch()` chaining and `try/catch` with `async/await`?
75. What is an unhandled Promise rejection?
76. What is the difference between microtasks and macrotasks?
77. Why do Promise callbacks run before `setTimeout` callbacks even with a 0ms delay?
78. What is the danger of using `async` inside `forEach`?
79. How do you run async operations sequentially vs in parallel?
80. What is a race condition in asynchronous JavaScript?
81. What is debouncing, and how does it differ from throttling?

---

# 11. The Event Loop & Concurrency Model

82. What is the event loop, and why does JavaScript need one?
83. What is the difference between the task queue and the microtask queue?
84. Why is JavaScript described as single-threaded, given Web Workers exist?
85. What is the difference between `requestAnimationFrame` and `setTimeout`?
86. What is `requestIdleCallback` used for?
87. What is `process.nextTick()` in Node.js, and how does its priority compare to Promises?

---

# 12. JavaScript Engine Internals

88. What is the difference between an interpreter and a JIT compiler?
89. What is an Abstract Syntax Tree (AST)?
90. What are "hidden classes" (shapes) in V8, and how do they optimize property access?
91. What is inline caching?
92. What causes a function to be deoptimized in V8?
93. What is the difference between monomorphic, polymorphic, and megamorphic code?

---

# 13. Memory Management & Garbage Collection

94. What is the difference between the stack and the heap?
95. What is garbage collection, and why doesn't JS require manual memory management?
96. What is the mark-and-sweep algorithm?
97. What are common causes of memory leaks in JavaScript?
98. How can detached DOM nodes or forgotten event listeners cause memory leaks?
99. What are `WeakMap` and `WeakSet`, and how do they help prevent memory leaks?
100.  What is a `WeakRef`?

---

# 14. Performance Optimization

101. What causes layout thrashing, and how can it be avoided?
102. What is the difference between reflow and repaint?
103. What is code splitting, and how does it improve performance?
104. What is tree shaking, and what conditions must be met for it to work?
105. What is the benefit of Web Workers for offloading computation?
106. What is list virtualization/windowing?
107. What is event delegation's performance benefit vs attaching handlers to every element?

---

# 15. Browser Internals & Rendering Pipeline

108. What are the main stages of the critical rendering path (DOM, CSSOM, render tree, layout, paint)?
109. What is compositing, and why are `transform`/`opacity` cheap to animate?
110. What triggers a synchronous layout (layout thrashing) in JavaScript?
111. What is the difference between `async` and `defer` script loading?

---

# 16. The DOM & Browser APIs

112. What is event bubbling vs event capturing?
113. What is event delegation, and why is it useful?
114. What is the difference between `stopPropagation()` and `preventDefault()`?
115. What are passive event listeners, and why do they matter for scroll performance?
116. What is the MutationObserver API used for?
117. What is the IntersectionObserver API used for?
118. What is the difference between `innerHTML`, `textContent`, and `innerText`?
119. Why is setting `innerHTML` with untrusted content a security risk?
120. What is the Shadow DOM, and how does it relate to Web Components?

---

# 17. Networking & Browser Communication

121. What is the difference between `XMLHttpRequest` and the Fetch API?
122. Does `fetch()` reject on HTTP error status codes like 404 or 500?
123. What is CORS, and why does the browser enforce it?
124. What is a preflight request?
125. What is the Same-Origin Policy?
126. What are WebSockets, and how do they differ from HTTP polling?
127. What are Server-Sent Events, and when would you use them over WebSockets?
128. What is a Service Worker, and how does it enable offline capabilities?
129. What is the difference between a Service Worker and a Web Worker?

---

# 18. Storage APIs

130. What is the difference between cookies, localStorage, and sessionStorage?
131. What are the `HttpOnly`, `Secure`, and `SameSite` cookie attributes?
132. Why is storing sensitive tokens in localStorage considered risky?
133. What is IndexedDB, and how does it differ from localStorage?

---

# 19. Error Handling

134. What is the difference between `try/catch/finally` behavior when both `try` and `finally` have `return`?
135. How do you create a custom error class, and why extend `Error`?
136. How does error handling differ between synchronous code and Promises?
137. What is the `unhandledrejection` event?
138. What is the difference between operational errors and programmer errors?

---

# 20. Security

139. What is Cross-Site Scripting (XSS), and what are its main types?
140. What is Cross-Site Request Forgery (CSRF), and how do `SameSite` cookies help mitigate it?
141. What is Content Security Policy (CSP)?
142. What is prototype pollution?
143. Why is `eval()` considered dangerous?
144. What is the security implication of `postMessage()` without validating the target origin?

---

# 21. Functional Programming Concepts

145. What are pure functions, and why do they make testing easier?
146. What is immutability, and why is it emphasized in functional programming?
147. What is function composition?
148. What are higher-order functions, and how do `map`/`filter`/`reduce` embody them?
149. What is the difference between eager and lazy evaluation?

---

# 22. Design Patterns in JavaScript

150. What is the Module pattern?
151. What is the Singleton pattern, and what's its downside for testability?
152. What is the Observer pattern, and where is it used in native browser APIs?
153. What is the difference between the Observer and Pub/Sub patterns?
154. What is the Factory pattern, and when would you prefer it over a constructor?
155. What is the Decorator pattern?
156. What is the Proxy pattern, and how does the native `Proxy` object implement it?
157. What is dependency injection, and how is it typically achieved in JS?

---

# 23. Proxy, Reflect & Meta-Programming

158. What is the `Proxy` object, and what problem does it solve?
159. What are traps in the context of a `Proxy`?
160. What is the `Reflect` object, and why was it introduced alongside `Proxy`?
161. How do modern reactive frameworks use `Proxy` internally?

---

# 24. Modules

162. What is the difference between CommonJS and ES Modules?
163. Why can't `import` statements be conditional the way `require()` calls can?
164. What is dynamic `import()`, and when would you use it?
165. What is circular dependency, and how do CommonJS and ESM handle it differently?
166. What is the difference between ESM's live bindings and CommonJS's copied exports?

---

# 25. Regular Expressions & String Internals

167. What is the difference between greedy and lazy quantifiers?
168. What is catastrophic backtracking?
169. How are strings represented internally in JS (UTF-16), and why does this matter for emoji handling?

---

# 26. Timers, Scheduling & Animation

170. Why is `setTimeout(fn, 0)` not truly "immediate"?
171. What is the difference between `setInterval` and recursive `setTimeout`?
172. Why is `requestAnimationFrame` preferred for animations over `setInterval`?

---

# 27. Common Interview Misconceptions

173. Does `let` eliminate hoisting entirely, or just change accessibility before declaration?
174. Does `const` make an object immutable?
175. Do arrow functions make better "methods" than regular functions in objects?
176. Does JavaScript pass objects "by reference," or is there a more accurate description?
177. Does garbage collection guarantee no memory leaks are possible?
178. Is `Array.prototype.sort()` stable by default?

---

# 28. Strict Mode & Language Semantics

179. What is strict mode, and what behaviors does it change?
180. How does strict mode affect the value of `this` in a standalone function call?
181. Does strict mode apply automatically inside ES modules and classes?

---

# 29. Testing Concepts

182. What is the difference between unit, integration, and end-to-end testing?
183. What is the difference between mocks, stubs, and spies?
184. What is code coverage, and what are its limitations as a quality metric?
185. What is flaky test behavior, and what commonly causes it in async JavaScript?

---

# 30. Build Tools & Tooling Concepts

186. What is transpilation, and how does it differ from compilation?
187. What is the difference between a polyfill and a shim?
188. What is source mapping, and why is it important for debugging bundled code?
189. What is Hot Module Replacement (HMR)?
190. What is semantic versioning, and how do `^` and `~` ranges differ?

---

# 31. Node.js-Specific Concepts

191. What is libuv, and what role does it play in Node.js's async architecture?
192. What is the difference between the Node.js and browser event loops?
193. What are streams in Node.js, and why are they important for large data?
194. What is backpressure in Node.js streams?
195. What is a Buffer in Node.js, and why is it needed alongside strings?
196. What is clustering in Node.js, given its single-threaded model?
197. What are worker threads, and how do they differ from clustering?

---

# 32. Type Coercion & Equality Deep Dive

198. Why does `"5" + 3` result in `"53"` but `"5" - 3` results in `2`?
199. What is the difference between `Number()`, `parseInt()`, and `parseFloat()`?
200. Why does `0.1 + 0.2 !== 0.3` in JavaScript?
201. What is `Number.MAX_SAFE_INTEGER`, and what happens beyond it?

---

# 33. Rendering Frameworks Concepts

202. What is the Virtual DOM, and what problem does it solve?
203. What is reconciliation in Virtual DOM diffing?
204. Why does using array index as a `key` in list rendering cause bugs?
205. What is unidirectional data flow?
206. What is hydration in server-side rendering?
207. What is the difference between CSR, SSR, and static site generation?

---

# 34. API Design & Best Practices

208. Why is mutating function arguments generally considered bad practice?
209. What is the benefit of returning `Promise` objects consistently rather than mixing sync/async returns?
210. What is the benefit of named parameters (object destructuring) over long positional parameter lists?
211. What is idempotency, and why does it matter for API design?
212. Why is throwing generic `Error` objects worse than custom error types?

---

# 35. Advanced Object & Array Edge Cases

213. What is the difference between `Map`/`Set` and plain objects/arrays?
214. Why might you choose a `Map` over an object for a frequently mutated key-value store?
215. What is the difference between `delete obj.prop` and setting `obj.prop = undefined`?
216. What are holes in arrays, and how do `map`/`forEach` treat them differently from `Array.from`?

---

# 36. Concurrency, Workers & Parallelism

217. What is a Web Worker, and how does it achieve true parallel execution?
218. What is the difference between structured cloning and transferable objects when messaging a Worker?
219. Why can't Web Workers directly access the DOM?

---

# 37. Advanced Follow-Up Questions

220. What happens if the outer variable in a closure is reassigned after the closure is created?
221. What is the value of `this` inside a nested arrow function within a regular method?
222. How would you implement inheritance without using the `class` keyword?
223. What is the difference between throwing inside an async function vs rejecting explicitly with `Promise.reject()`?
224. Can you get a true race condition in JavaScript despite it being single-threaded?
225. Why does keeping a reference to just one property of a large object still risk retaining the whole object in some engines?

---

# 38. Misscelaneous

226. is js pass by value or pass by reference
227. what is localeCompare
