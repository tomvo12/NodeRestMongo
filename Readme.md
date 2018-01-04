# REST API service based on NodeJS and Azure Cosmos DB

This app demonstrates how to create a REST API with NodeJS/Express using Azure Cosmos DB as backend data store.

Additionally, an Azure Active Directory App Service Principal authentication is required to access the data using the API.

The API is fully described using Swagger so that a client proxy can be created automatically.

To complete the whole dev cycle, a simple unit test has been added using mocha/chai.

# Installation

Clone this repository and install the required dependencies running "yarn install" or "npm install".

To fully use the code, you need at least 2 AAD Service Principals. One to run the service in an Azure App Service and the 2nd to perform a client side authentication.
