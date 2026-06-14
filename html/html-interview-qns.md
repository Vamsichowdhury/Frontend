# HTML Interview Questions & Answers

A comprehensive guide covering HTML concepts from beginner to advanced — tailored for frontend developer interviews.

---

## Table of Contents

1. [Basics](https://claude.ai/chat/2682b862-5b8f-4c85-8fff-3fa2a9033ffc#basics)
2. [Semantic HTML](https://claude.ai/chat/2682b862-5b8f-4c85-8fff-3fa2a9033ffc#semantic-html)
3. [Forms &amp; Input](https://claude.ai/chat/2682b862-5b8f-4c85-8fff-3fa2a9033ffc#forms--input)
4. [Media &amp; Embeds](https://claude.ai/chat/2682b862-5b8f-4c85-8fff-3fa2a9033ffc#media--embeds)
5. [Accessibility (a11y)](https://claude.ai/chat/2682b862-5b8f-4c85-8fff-3fa2a9033ffc#accessibility-a11y)
6. [HTML5 APIs &amp; Features](https://claude.ai/chat/2682b862-5b8f-4c85-8fff-3fa2a9033ffc#html5-apis--features)
7. [Performance &amp; Best Practices](https://claude.ai/chat/2682b862-5b8f-4c85-8fff-3fa2a9033ffc#performance--best-practices)
8. [Tricky / Advanced](https://claude.ai/chat/2682b862-5b8f-4c85-8fff-3fa2a9033ffc#tricky--advanced)

---

## Basics

### Q1. What is the difference between HTML elements and HTML tags?

**Answer:**

- A **tag** is the actual markup syntax: `<p>`, `</p>`, `<img />`
- An **element** is the complete unit — the opening tag, content, and closing tag together.

```html
<!-- Tag: <p> and </p> -->
<!-- Element: the whole thing below -->
<p>Hello World</p>
```

> **Interview tip:** Tags are syntax; elements are the DOM nodes that result from them.

---

### Q2. What is the difference between `id` and `class` attributes?

| Feature      | `id`                        | `class`                             |
| ------------ | --------------------------- | ----------------------------------- |
| Uniqueness   | Must be unique per page     | Can be reused on multiple elements  |
| CSS selector | `#myId`                     | `.myClass`                          |
| JS selector  | `document.getElementById()` | `document.getElementsByClassName()` |
| Specificity  | Higher (0,1,0,0)            | Lower (0,0,1,0)                     |

```html
<div id="header">Only one header</div>
<div class="card">Card 1</div>
<div class="card">Card 2</div>
```

---

### Q3. What is the `<!DOCTYPE html>` declaration and why is it needed?

**Answer:**

`<!DOCTYPE html>` tells the browser which version of HTML the page is written in. Without it, browsers fall into **Quirks Mode** — an old compatibility mode that mimics buggy behavior of legacy browsers.

```html
<!DOCTYPE html>
<!-- Always the very first line -->
<html lang="en">
  ...
</html>
```

> In HTML5, this is the only doctype you need. Earlier HTML versions had complex doctype strings.

---

### Q4. What is the difference between `<head>` and `<body>`?

| `<head>`                               | `<body>`                             |
| -------------------------------------- | ------------------------------------ |
| Not rendered visually                  | Rendered on the page                 |
| Contains metadata                      | Contains visible content             |
| `<title>`,`<meta>`,`<link>`,`<script>` | `<div>`,`<p>`,`<img>`,`<form>`, etc. |

---

### Q5. What are void elements (self-closing elements)?

**Answer:**

Void elements have **no content or closing tag** . They cannot have children.

```html
<br />
<!-- Line break -->
<hr />
<!-- Horizontal rule -->
<img />
<!-- Image -->
<input />
<!-- Input field -->
<link />
<!-- External resource -->
<meta />
<!-- Metadata -->
<source />
<!-- Media source -->
```

In HTML5, the trailing slash is optional: `<br>` and `<br />` are both valid.

---

### Q6. What is the difference between `<b>` vs `<strong>`, and `<i>` vs `<em>`?

| Tag        | Visual   | Semantic meaning                                |
| ---------- | -------- | ----------------------------------------------- |
| `<b>`      | **Bold** | No semantic meaning — purely visual             |
| `<strong>` | **Bold** | Important content — screen readers emphasize it |
| `<i>`      | _Italic_ | No semantic meaning — purely visual             |
| `<em>`     | _Italic_ | Stressed emphasis — screen readers change tone  |

```html
<!-- Prefer semantic tags for accessibility -->
<strong>Warning: Do not delete this file.</strong>
<em>Please read this carefully.</em>
```

---

## Semantic HTML

### Q7. What is semantic HTML and why does it matter?

**Answer:**

Semantic HTML uses elements that **describe the meaning** of content, not just its appearance.

**Benefits:**

- Better **accessibility** — screen readers understand the structure
- Better **SEO** — search engines understand page hierarchy
- Better **maintainability** — developers understand intent at a glance

```html
<!-- ❌ Non-semantic -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">...</div>
<div class="footer">...</div>

<!-- ✅ Semantic -->
<header>
  <nav>...</nav>
</header>
<main>...</main>
<footer>...</footer>
```

---

### Q8. What are the key HTML5 semantic elements?

```html
<header>
  <!-- Introductory content / site header -->
  <nav>
    <!-- Navigation links -->
    <main>
      <!-- Main content of the page (only one per page) -->
      <article>
        <!-- Self-contained, shareable content (blog post, news article) -->
        <section>
          <!-- Thematic grouping of content with a heading -->
          <aside>
            <!-- Sidebar, callout, related content -->
            <footer>
              <!-- Footer for the page or a section -->
              <figure>
                <!-- Image, chart, diagram with optional caption -->
                <figcaption>
                  <!-- Caption for a <figure> -->
                  <time>
                    <!-- A date/time value -->
                    <mark>
                      <!-- Highlighted/relevant text -->
                      <details>
                        <!-- Expandable disclosure widget -->
                        <summary>
                          <!-- Visible heading for <details> -->
                        </summary>
                      </details></mark
                    ></time
                  >
                </figcaption>
              </figure>
            </footer>
          </aside>
        </section>
      </article>
    </main>
  </nav>
</header>
```

---

### Q9. What is the difference between `<article>` and `<section>`?

| `<article>`                                 | `<section>`                                   |
| ------------------------------------------- | --------------------------------------------- |
| Self-contained, independently distributable | Thematic grouping, not necessarily standalone |
| Makes sense on its own (e.g., RSS feed)     | Groups related content with a heading         |
| Blog post, forum thread, news article       | Chapter of a document, tab panel              |

```html
<article>
  <h2>How Redux Works</h2>
  <section>
    <h3>Actions</h3>
    <p>...</p>
  </section>
  <section>
    <h3>Reducers</h3>
    <p>...</p>
  </section>
</article>
```

---

### Q10. What is the difference between `<div>` and `<span>`?

| `<div>`                         | `<span>`                            |
| ------------------------------- | ----------------------------------- |
| Block-level element             | Inline element                      |
| Takes full width by default     | Only takes the width of its content |
| Used for grouping block content | Used for grouping inline content    |

```html
<div class="card">
  <p>User: <span class="highlight">Vamsi</span></p>
</div>
```

---

## Forms & Input

### Q11. What are the different `<input>` types in HTML5?

```html
<input type="text" />
<!-- Plain text -->
<input type="email" />
<!-- Email with validation -->
<input type="password" />
<!-- Masked text -->
<input type="number" />
<!-- Numeric input -->
<input type="checkbox" />
<!-- Checkbox -->
<input type="radio" />
<!-- Radio button -->
<input type="range" />
<!-- Slider -->
<input type="date" />
<!-- Date picker -->
<input type="file" />
<!-- File upload -->
<input type="color" />
<!-- Color picker -->
<input type="tel" />
<!-- Phone number -->
<input type="url" />
<!-- URL with validation -->
<input type="search" />
<!-- Search box -->
<input type="hidden" />
<!-- Hidden field (not shown to user) -->
<input type="submit" />
<!-- Submit button -->
<input type="reset" />
<!-- Reset form -->
```

---

### Q12. What is the purpose of `<label>` in forms?

**Answer:**

`<label>` associates descriptive text with a form control. It improves:

- **Accessibility** — screen readers announce the label when the input is focused
- **Usability** — clicking the label focuses/activates the input

```html
<!-- Method 1: Using `for` + `id` (explicit) -->
<label for="username">Username</label>
<input type="text" id="username" name="username" />

<!-- Method 2: Wrapping (implicit) -->
<label>
  Email
  <input type="email" name="email" />
</label>
```

---

## Media & Embeds

### Q13. What are the attributes of the `<img>` tag and which are mandatory?

```html
<img
  src="photo.jpg"       <!-- REQUIRED: image URL -->
  alt="A mountain view" <!-- REQUIRED: alternative text for accessibility -->
  width="800"           <!-- Optional: display width in px -->
  height="600"          <!-- Optional: display height in px (prevents CLS) -->
  loading="lazy"        <!-- Optional: defers loading until in viewport -->
  decoding="async"      <!-- Optional: async image decoding -->
>
```

> `src` and `alt` are mandatory. An empty `alt=""` is valid for decorative images.

---

### Q14. What is the `srcset` attribute and why is it used?

**Answer:**

`srcset` lets you provide multiple image sources for different screen sizes/resolutions, enabling **responsive images** .

```html
<img
  src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="Responsive image"
/>
```

The browser picks the best image based on the device's screen size and pixel density — saving bandwidth on mobile.

---

### Q15. How do you embed a video in HTML5?

```html
<video width="720" controls autoplay muted loop poster="thumbnail.jpg">
  <source src="video.mp4" type="video/mp4" />
  <source src="video.webm" type="video/webm" />
  Your browser does not support the video tag.
</video>
```

| Attribute  | Meaning                                                 |
| ---------- | ------------------------------------------------------- |
| `controls` | Shows play/pause/volume UI                              |
| `autoplay` | Starts automatically (requires `muted`in most browsers) |
| `muted`    | Starts muted                                            |
| `loop`     | Loops the video                                         |
| `poster`   | Thumbnail shown before play                             |

---

## Accessibility (a11y)

### Q16. What are ARIA attributes and when should you use them?

**Answer:**

ARIA (Accessible Rich Internet Applications) attributes add semantic meaning to elements that don't have it natively — especially for dynamic or custom UI components.

```html
<!-- Role: what the element IS -->
<div role="button" tabindex="0">Click me</div>

<!-- State: current condition -->
<button aria-pressed="true">Mute</button>
<div aria-expanded="false">Accordion header</div>

<!-- Property: describes the element -->
<input aria-label="Search products" type="text" />
<div aria-live="polite">Loading...</div>
<!-- Announces dynamic content -->

<!-- Relationship -->
<button aria-controls="menu">Open Menu</button>
<ul id="menu">
  ...
</ul>
```

> **Rule:** Use native HTML elements first. Only add ARIA when the native element doesn't express the needed role/state.

---

### Q17. What is `tabindex` and how does it affect keyboard navigation?

| Value           | Behavior                                                     |
| --------------- | ------------------------------------------------------------ |
| `tabindex="0"`  | Element joins the natural tab order                          |
| `tabindex="-1"` | Element is focusable via JS (`.focus()`) but not via Tab key |
| `tabindex="1+"` | Positive value — appears BEFORE natural order (avoid this)   |

```html
<!-- Make a custom div keyboard-focusable -->
<div role="button" tabindex="0" onclick="doSomething()">Custom Button</div>

<!-- Focus via JS without adding to tab order -->
<div id="modal" tabindex="-1">...</div>
<script>
  document.getElementById("modal").focus();
</script>
```

---

### Q18. What does the `alt` attribute do and when should it be empty?

```html
<!-- Descriptive: meaningful image -->
<img src="profile.jpg" alt="Vamsi's profile photo" />

<!-- Empty: purely decorative image (screen reader skips it) -->
<img src="divider.png" alt="" />

<!-- Icon next to text (text already describes it) -->
<button>
  <img src="search-icon.svg" alt="" />
  Search
</button>
```

> **Never omit `alt` entirely** — screen readers will read the filename instead, which is useless.

---

## HTML5 APIs & Features

### Q19. What is the `data-*` attribute?

**Answer:**

`data-*` allows you to embed custom data into HTML elements without using non-standard attributes or hidden fields. The data is accessible via JavaScript using `dataset`.

```html
<button data-user-id="42" data-action="delete">Delete</button>

<script>
  const btn = document.querySelector("button");
  console.log(btn.dataset.userId); // "42"
  console.log(btn.dataset.action); // "delete"
</script>
```

Common use: passing data from server-rendered HTML to JavaScript.

---

### Q20. What is the difference between `localStorage`, `sessionStorage`, and cookies?

| Feature            | `localStorage` | `sessionStorage` | Cookies                    |
| ------------------ | -------------- | ---------------- | -------------------------- |
| Expires            | Never          | On tab close     | Set by `Expires`/`Max-Age` |
| Capacity           | ~5–10 MB       | ~5 MB            | ~4 KB                      |
| Sent with requests | No             | No               | Yes (automatically)        |
| Access             | JS only        | JS only          | JS + Server                |
| Scope              | Same origin    | Same tab         | Configurable               |

---

### Q21. What is the `<template>` element?

**Answer:**

`<template>` holds HTML that is **not rendered** when the page loads. It's a client-side template — you clone and inject its content via JavaScript when needed.

```html
<template id="card-template">
  <div class="card">
    <h3 class="card-title"></h3>
    <p class="card-body"></p>
  </div>
</template>

<script>
  const tmpl = document.getElementById("card-template");
  const clone = tmpl.content.cloneNode(true);
  clone.querySelector(".card-title").textContent = "React Hooks";
  document.body.appendChild(clone);
</script>
```

---

### Q22. What is the `defer` vs `async` attribute on `<script>`?

```html
<!-- Normal: blocks HTML parsing until script downloads + executes -->
<script src="app.js"></script>

<!-- async: downloads in parallel, executes immediately when ready (may block parsing) -->
<script async src="analytics.js"></script>

<!-- defer: downloads in parallel, executes AFTER HTML is fully parsed -->
<script defer src="app.js"></script>
```

|         | Download | Execution   | Order guaranteed? |
| ------- | -------- | ----------- | ----------------- |
| Normal  | Blocks   | Blocks      | Yes               |
| `async` | Parallel | Immediately | No                |
| `defer` | Parallel | After parse | Yes               |

> **Best practice:** Use `defer` for most scripts. Use `async` for independent scripts like analytics.

---

## Performance & Best Practices

### Q23. What are meta tags used for? List important ones.

```html
<head>
  <!-- Character encoding — always include -->
  <meta charset="UTF-8" />

  <!-- Responsive design — always include -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- SEO description -->
  <meta name="description" content="Frontend developer portfolio of Vamsi" />

  <!-- Prevent caching -->
  <meta http-equiv="Cache-Control" content="no-cache" />

  <!-- Open Graph (social sharing previews) -->
  <meta property="og:title" content="My Portfolio" />
  <meta property="og:image" content="https://mysite.com/preview.png" />
  <meta property="og:description" content="Check out my work" />

  <!-- Twitter card -->
  <meta name="twitter:card" content="summary_large_image" />
</head>
```

---

### Q24. What is the difference between `<link>` and `<script>` placement in HTML?

```html
<head>
  <!-- CSS in <head>: loaded before render — prevents FOUC (Flash of Unstyled Content) -->
  <link rel="stylesheet" href="styles.css" />
</head>

<body>
  <!-- Content here -->

  <!-- Scripts before </body>: HTML parses first, then JS runs -->
  <script src="app.js"></script>
  <!-- Or use defer in <head> — same effect -->
</body>
```

---

### Q25. How do you optimize images in HTML for performance?

```html
<!-- 1. Specify width/height to prevent CLS (Cumulative Layout Shift) -->
<img src="hero.jpg" alt="Hero" width="1200" height="600" />

<!-- 2. Lazy load below-the-fold images -->
<img src="feature.jpg" alt="Feature" loading="lazy" />

<!-- 3. Use modern formats with fallback -->
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Optimized image" />
</picture>

<!-- 4. Serve responsive sizes -->
<img
  src="img-800.jpg"
  srcset="img-400.jpg 400w, img-800.jpg 800w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="Responsive"
/>
```

---

## Tricky / Advanced

### Q26. What is the difference between `innerHTML`, `innerText`, and `textContent`?

| Property      | Returns                     | Parses HTML | Performance              |
| ------------- | --------------------------- | ----------- | ------------------------ |
| `innerHTML`   | HTML markup                 | Yes         | Slower (re-parses DOM)   |
| `innerText`   | Visible text only           | No          | Slower (triggers reflow) |
| `textContent` | All text (including hidden) | No          | Fastest                  |

```html
<div id="demo">Hello <span style="display:none">hidden</span> World</div>

<script>
  const el = document.getElementById("demo");
  el.innerHTML; // "Hello <span style="display:none">hidden</span> World"
  el.innerText; // "Hello World" (skips hidden text)
  el.textContent; // "Hello hidden World" (includes hidden)
</script>
```

> **Security:** Never use `innerHTML` with user-provided data — it opens XSS vulnerabilities.

---

### Q27. What is the difference between `<iframe>` and `<embed>`?

|                  | `<iframe>`                        | `<embed>`                            |
| ---------------- | --------------------------------- | ------------------------------------ |
| Purpose          | Embeds another HTML page          | Embeds external content (PDF, Flash) |
| Has DOM          | Yes — full document               | No                                   |
| JS communication | `postMessage`API                  | Limited                              |
| Common use       | Maps, videos, third-party widgets | PDFs, plugins (legacy)               |

```html
<!-- Embed a Google Map -->
<iframe
  src="https://maps.google.com/..."
  width="600"
  height="400"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="Office location map"
></iframe>
```

---

### Q28. What is the `<picture>` element?

**Answer:**

`<picture>` gives the browser a choice of image sources based on media conditions or format support — more powerful than `srcset` alone.

```html
<picture>
  <!-- Art direction: different crop for mobile -->
  <source media="(max-width: 600px)" srcset="hero-mobile.jpg" />
  <source media="(min-width: 601px)" srcset="hero-desktop.jpg" />

  <!-- Format: browser picks best supported -->
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />

  <!-- Fallback: always required -->
  <img src="hero.jpg" alt="Hero image" />
</picture>
```

---

### Q29. What is the `rel` attribute on `<link>` and `<a>` tags?

```html
<!-- On <link>: defines relationship between document and resource -->
<link rel="stylesheet" href="style.css" />
<link rel="icon" href="favicon.ico" />
<link rel="preload" href="font.woff2" as="font" crossorigin />
<link rel="canonical" href="https://mysite.com/page" />

<!-- On <a>: security and behavior -->
<a href="https://external.com" rel="noopener noreferrer" target="_blank">
  External Link
</a>
<!-- noopener: prevents new tab from accessing window.opener -->
<!-- noreferrer: doesn't send Referer header -->
```

> Always use `rel="noopener noreferrer"` on `target="_blank"` links to prevent tabnapping attacks.

---

### Q30. What is `contenteditable`?

**Answer:**

`contenteditable` makes any HTML element editable in the browser — like a mini rich text editor.

```html
<div contenteditable="true" style="border: 1px solid #ccc; padding: 8px;">
  Click here and start typing...
</div>

<!-- Read the content via JS -->
<script>
  const el = document.querySelector("[contenteditable]");
  console.log(el.innerHTML); // Contains formatted HTML
  console.log(el.textContent); // Plain text only
</script>
```

Used in rich text editors like Notion, Quill, and Slate.js.

---

### Q31. What is the difference between `display: none` and `visibility: hidden` and the `hidden` attribute?

|                      | Removed from layout?         | Screen reader sees it? |
| -------------------- | ---------------------------- | ---------------------- |
| `display: none`      | Yes                          | No                     |
| `visibility: hidden` | No (space preserved)         | No                     |
| `opacity: 0`         | No                           | Yes                    |
| `hidden`attribute    | Yes (same as `display:none`) | No                     |

```html
<!-- HTML hidden attribute -->
<p hidden>This paragraph is hidden</p>

<!-- Equivalent to -->
<p style="display: none">This paragraph is hidden</p>
```

---

### Q32. What is the Critical Rendering Path?

**Answer:**

The browser steps to render a page:

1. **Parse HTML** → build DOM
2. **Parse CSS** → build CSSOM
3. **Combine** DOM + CSSOM → **Render Tree**
4. **Layout** → calculate positions and sizes
5. **Paint** → draw pixels on screen

**How HTML affects this:**

- `<script>` in `<head>` without `defer`/`async` **blocks** HTML parsing
- CSS in `<head>` **blocks rendering** (needed to avoid FOUC)
- Large HTML documents delay Time to First Byte (TTFB)

```html
<!-- Optimized HTML structure -->
<head>
  <link rel="stylesheet" href="critical.css" />
  <!-- Render-blocking (necessary) -->
  <link rel="preload" href="font.woff2" as="font" />
  <!-- Preload key resources -->
  <script defer src="app.js"></script>
  <!-- Non-blocking JS -->
</head>
```

---

_Last updated: June 2026 | Covers HTML5 standards_
