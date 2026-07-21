function fetchProfile() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = {
        id: 1,
        name: "Vamsi",
        isAdmin: false,
      };
      resolve(user);
    }, 3000);
  });
}

function fetchPermissions() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const permissions = {
        dashboardView: true,
        dashboardEdit: false,
        usersView: false,
        usersEdit: false,
        settingsView: false,
        settingsEdit: false,
      };
      resolve(permissions);
    }, 6000);
  });
}

function fetchFeatureFlags(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const featureFlags = {
        betaDashboard: false,
        newSettingsPage: true,
        userManagement: false,
      };
      resolve(featureFlags);
    }, 2000);
  });
}

async function initializeApp() {
  try {
    const [user, permissions, featureFlags] = await Promise.all([
      fetchProfile(),
      fetchPermissions(),
      fetchFeatureFlags(),
    ]);
    console.log("User:", user);
    console.log("Permissions:", permissions);
    console.log("Feature Flags:", featureFlags);
  } catch (error) {
    console.error("Error initializing app:", error);
  }
}

initializeApp();
