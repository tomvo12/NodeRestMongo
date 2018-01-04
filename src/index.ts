import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as ExpressValidator from "express-validator";

import * as mongoose from 'mongoose';

import * as passport from 'passport';
const BearerStrategy = require('passport-azure-ad').BearerStrategy;

import { credentials, mongoConfig, serverPort, appInsightsInstrumentationKey, baseUrl, tenantName, clientID } from './config';

import * as swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('json-loader!yaml-loader!./swagger.yaml');
swaggerDocument.host = baseUrl;
swaggerDocument.securityDefinitions.userstore_auth.authorizationUrl = "https://login.microsoftonline.com/"
    + tenantName + ".onmicrosoft.com/oauth2/authorize";
swaggerDocument.securityDefinitions.userstore_auth.clientID = clientID;

import { default as User, UserModel } from "./models/User";

import * as userController from "./controllers/user";

const authenticationStrategy = new BearerStrategy(credentials, (token: any, done: any) => {
    // let userToken = authenticatedUserTokens.find((user) => user.appid === token.appid);
    let user = "DevCloud-ITSPS";

    // if (!userToken) {
    //     authenticatedUserTokens.push(token);
    // }

    return done(null, user, token);
});

passport.use(authenticationStrategy);

// setup ApplicationInsights
import * as appInsights from 'applicationinsights';
import { triggerAsyncId } from 'async_hooks';

appInsights.setup(appInsightsInstrumentationKey)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectRequests(true)
    .setAutoCollectConsole(true)
    .setAutoCollectDependencies(true)
    .start();

const mongoUri = `mongodb://${mongoConfig.account}:${mongoConfig.key}@${mongoConfig.account}.documents.azure.com:10255/${mongoConfig.dbName}?ssl=true&replicaSet=globaldb`;

// some initial data
const seedData = [
    { UPN: "tstx_a_thschan@corptestp.onmicrosoft.com", Email: "tschanko@istruct.de", DisplayName: "Thomas Schanko", LicenseType: "Basic" },
    { UPN: "tstx_a_vosstho@corptestp.onmicrosoft.com", Email: "voss@icomcept.de", DisplayName: "Tom Voss", LicenseType: "Basic" },
    { UPN: "tstx_a_tgunst@corptestp.onmicrosoft.com", Email: "thomas.gunst@daimler.com", DisplayName: "Thomas Gunst", LicenseType: "Basic" },
    { UPN: "tstx_a_afassel@corptestp.onmicrosoft.com", Email: "alexander.fassel@daimler.com", DisplayName: "Alexander Fassel", LicenseType: "Basic" },
    { UPN: "afassel@emea.corpdir.net", Email: "alexander.fassel@daimler.com", DisplayName: "Alexander Fassel", LicenseType: "Stakeholder" },
];

(<any>mongoose).Promise = global.Promise;   // get rid of mongoose promise warning

(async () => {
    try {
        await mongoose.connect(mongoUri, { useMongoClient: true });
    }
    catch (err) {
        console.log("Error connecting to Cosmos DB, " + err);
    }

    seedData.map(async (x) => {
        try {
            var u = new User({ UPN: x.UPN, Email: x.Email, DisplayName: x.DisplayName, LicenseType: x.LicenseType });
            let user = await User.findOne({ UPN: x.UPN }).exec();
            if (!user) {
                await u.save();
            }
        }
        catch (err) {
            console.log("error saving user: " + err);
        }
    })
})();

// set up express application
export const app = express();

// include passport for AAD auth
app.use(passport.initialize());
app.use(passport.session());

// include body-parser to access incoming json data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// create path for swagger documentation
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// include express validation features
app.use(ExpressValidator());

app.get('/api/user/count', passport.authenticate('oauth-bearer', {
    session: false
}), userController.getCount);

app.get('/api/user/:upn', passport.authenticate('oauth-bearer', {
    session: false
}), userController.getUser);

app.get('/api/user', passport.authenticate('oauth-bearer', {
    session: false
}), userController.getAllUsers);

app.post('/api/user', passport.authenticate('oauth-bearer', {
    session: false
}), userController.postUser);

app.put('/api/user/:upn', passport.authenticate('oauth-bearer', {
    session: false
}), userController.putUser);

app.delete('/api/user/:upn', passport.authenticate('oauth-bearer', {
    session: false
}), userController.deleteUser);

// configure routes
app.get('/', (req, res, next) => {
    res.send('Try: curl -isS -X GET ' + baseUrl + '/api');
    next();
});

let start = Date.now();

app.listen(serverPort, () => {
    let duration = Date.now() - start;
    appInsights.defaultClient.trackMetric({ name: "server start time", value: duration});
    console.log('Server listening on port 3000');
});
