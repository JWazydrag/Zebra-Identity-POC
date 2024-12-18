document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  console.log("Device is ready");
  // Initialize MSAL authentication silently
  initializeMSAL();

  // Bind button click event
  document.getElementById("ajaxButton").addEventListener("click", makeAjaxCall);
}

function initializeMSAL() {
  console.log("Initializing MSAL");
  // MSAL initialization for Cordova-based applications
  var msalConfig = {
    clientId: "d1dc0a5d-30e7-4e29-81e6-eb71eb0383da",
    scopes: ["api://d26553c9-3420-4e26-bd39-653e72816dbb/impersonate"],
    tenantId: "cd89a5af-ce48-4dba-bf05-3e0d8472b70e",
    authorizationUserAgent: "DEFAULT",
    accountMode: "SINGLE",
  };
  try {
    window.cordova.plugins.msalPlugin.msalInit(
      (success) => {
        console.log("MSAL initialized successfully:", success);

        // Attempt silent login
        cordova.plugins.msalPlugin.getAccounts(
          function (response) {
            console.log("Accounts response:", response);
            if (response.length === 0) {
              window.cordova.plugins.msalPlugin.signInInteractive(
                (msalResponse) => {
                  console.log(msalResponse, "msalResponse");
                  window.msalAccessToken = msalResponse.accessToken;
                },
                (error) => {
                  console.log(error, "error");
                },
                {
                  prompt: "LOGIN",
                }
              );
            } else {
              // Account exists, get token silently
              window.cordova.plugins.msalPlugin.acquireTokenSilent(
                (tokenResponse) => {
                  console.log("Token acquired silently:", tokenResponse);
                  window.msalAccessToken = tokenResponse.accessToken;
                },
                (error) => {
                  console.log("Error acquiring token silently:", error);
                  // Fall back to interactive sign-in if silent acquisition fails
                  window.cordova.plugins.msalPlugin.signInInteractive(
                    (msalResponse) => {
                      console.log(
                        "Interactive sign-in successful:",
                        msalResponse
                      );
                      window.msalAccessToken = msalResponse.accessToken;
                    },
                    (error) => {
                      console.log("Interactive sign-in error:", error);
                    },
                    {
                      prompt: "LOGIN",
                    }
                  );
                },
                {
                  scopes: msalConfig.scopes,
                }
              );
            }
          },
          function (error) {
            console.log("Error getting accounts:", error);
            window.cordova.plugins.msalPlugin.signInInteractive(
              (msalResponse) => {
                console.log(msalResponse);
              },
              (error) => {
                console.log(error);
              },
              {
                prompt: "LOGIN",
              }
            );
          }
        );
      },
      (error) => {
        console.log("MSAL initialization error:", error);
      },
      msalConfig
    );
  } catch (error) {
    console.log("Caught error during MSAL initialization:", error);
  }
}

function makeAjaxCall() {
  console.log("Making AJAX call");
  const authHeader = "Basic " + btoa(`${"JWAZYDRAG"}:${"Havensight_003"}`);

  // Use the MSAL token if available
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  if (window.msalAccessToken) {
    headers.Authorization = `Bearer ${window.msalAccessToken}`;
  }

  fetch(
    "https://hs4.havensightconsulting.com:8443/sap/opu/odata/sap/ZHCG_MITV4_SRV/",
    {
      headers: headers,
    }
  )
    .then((response) => {
      console.log("AJAX response received:", response);
      return response.json();
    })
    .then((data) => {
      console.log("Data received:", data);
      document.getElementById("result").innerHTML = JSON.stringify(data);
    })
    .catch((error) => {
      console.log("AJAX call error:", error);
      document.getElementById("result").innerHTML = "Error: " + error.message;
    });
}
