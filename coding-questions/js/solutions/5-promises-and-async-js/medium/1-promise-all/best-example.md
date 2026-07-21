# User Login Example

---

# Real-World Scenario

Imagine a user successfully logs into your application.

After login, your app needs to fetch:

- 👤 User Profile
- 🔐 User Permissions
  - [ "dashboard:view",users:view","users:edit" ,"reports:view"]
- 🚩 Feature Flags
  - Admin
    - [Dashboard,Users,Reports,Settings]
  - Normal User
    - [Dashboard,Reports]

These APIs are independent, so they can be requested simultaneously.

However, **the application should not initialize until all three responses are available.**

---

# Why?

Suppose your application starts rendering immediately after receiving only the user profile.

```
User Profile        ✔

Permissions         ❌

Feature Flags       ❌
```

Problems:

- You don't know which menu items the user can access.
- You don't know which routes should be protected.
- You don't know which experimental features are enabled.

The UI may display incorrect information or expose unauthorized actions.

Instead, wait until **everything is ready**, then initialize the application.

---

# Fake APIs

```javascript
function fetchProfile() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: "John",
      });
    }, 1000);
  });
}

function fetchPermissions() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["Dashboard", "Users", "Settings"]);
    }, 2000);
  });
}

function fetchFeatureFlags() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        darkMode: true,
        betaDashboard: false,
      });
    }, 3000);
  });
}
```

---

# Without Promise.all()

```javascript
async function initializeApp() {
  const profile = await fetchProfile();

  const permissions = await fetchPermissions();

  const featureFlags = await fetchFeatureFlags();

  console.log(profile);
  console.log(permissions);
  console.log(featureFlags);
}
```

### Timeline

```
Profile API

|------1 sec------|

↓

Permissions API

|----------2 sec----------|

↓

Feature Flags API

|-------------3 sec-------------|

Total Time = 6 seconds
```

Each request waits for the previous one to complete.

---

# With Promise.all()

```javascript
async function initializeApp() {
  const [profile, permissions, featureFlags] = await Promise.all([
    fetchProfile(),
    fetchPermissions(),
    fetchFeatureFlags(),
  ]);

  console.log(profile);
  console.log(permissions);
  console.log(featureFlags);

  console.log("Application Initialized");
}
```

### Timeline

```
Time →

0 sec

Profile API

|------1 sec------|

Permissions API

|----------2 sec----------|

Feature Flags API

|-------------3 sec-------------|

Application Initialized

↑
Waits only for the slowest API

Total Time = 3 seconds
```

All APIs start immediately.

`Promise.all()` waits until every promise is fulfilled.

---

# Output

```text
{
  id: 1,
  name: "John"
}

[
  "Dashboard",
  "Users",
  "Settings"
]

{
  darkMode: true,
  betaDashboard: false
}

Application Initialized
```

---

# Why Promise.all() Makes Sense Here

Without all three APIs:

- ❌ You don't know who the user is.
- ❌ You don't know what pages they can access.
- ❌ You don't know which features should be enabled.

Only after all responses arrive can the application safely initialize.

```javascript
initializeApplication({
  profile,
  permissions,
  featureFlags,
});
```

This is the perfect use case for `Promise.all()` because the next step depends on **all** the data.

---

# When NOT to Use Promise.all()

Suppose your home page has:

```
User Profile

Latest Posts

Notifications
```

Each section can load independently.

Instead of waiting for everything,

```javascript
const profilePromise = fetchProfile();
const postsPromise = fetchPosts();
const notificationsPromise = fetchNotifications();

profilePromise.then(renderProfile);
postsPromise.then(renderPosts);
notificationsPromise.then(renderNotifications);
```

Now,

```
1 sec

Profile appears

↓

2 sec

Posts appear

↓

3 sec

Notifications appear
```

This provides a better user experience because users don't wait for the slowest API.

---

# Interview One-Liner

> **`Promise.all()` is used to run multiple independent asynchronous operations concurrently and returns a single promise that resolves only when every promise succeeds. It is ideal when the next operation requires all the results, such as initializing an application after login with the user's profile, permissions, and feature flags.**
