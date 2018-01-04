export const tenantName = process.env.tenantName || "Your tenant name here, e.g. Contoso";
export const clientID = process.env.clientID || "The client id (app id) of the service principal to run the app";

export const serverPort = process.env.PORT || 3000;

export const baseUrl = process.env.baseUrl || "http://localhost:3000"

export const credentials = {
  // authentication settings
  identityMetadata: `https://login.microsoftonline.com/${tenantName}.onmicrosoft.com/.well-known/openid-configuration`,
  clientID: clientID,
  allowHttpForRedirectUrl: true,
  redirectUrl: process.env.RedirectUrl || "http://localhost:3000/api"
  // audience: "a9f223de-d65d-4a3a-8732-69e500118242"
};

export const mongoConfig = {
  account: process.env.mongoAccount || "Your Cosmos DB account name",
  key: process.env.mongoKey || "Your Cosmos DB read/write access key",
  dbName: process.env.mongoDb || "demo"
}

export const appInsightsInstrumentationKey = process.env.InstrumentationKey || "Your Application Insights instrumentation key";
