import { AuthenticationContext, TokenResponse } from 'adal-node';

// acquire azure app service auth token
export const getToken = () => {
    let applicationId = "Service Principal AppId";
    let tenant = "e.g. corptestp.onmicrosoft.com";
    let authUrl = 'https://login.windows.net/' + tenant;
    let resource = "54a2105c-c62f-4105-a62d-e2972f0b7fc2";
    let key = "Service Principal Key";

    let context = new AuthenticationContext(authUrl);
    return new Promise((resolve, reject) => {
        context.acquireTokenWithClientCredentials(resource, applicationId, key, (err, tokenResponse) => {
            console.log("ok");
            if (err) {
                console.log("failed to acquire token: " + err);
                reject(err);
            } else {
                let authString = "Bearer " + (<TokenResponse>tokenResponse).accessToken;
                console.log("Authorization: " + authString);
                resolve(authString);
            }
        });
    });
};

// demonstrates how to get an access token to call the API service from node
let bearerToken;
(() => {
    getToken().then((authString) => {
        bearerToken = authString;
        console.log("received bearer token: " + bearerToken);
    });
})();
