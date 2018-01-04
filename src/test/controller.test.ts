import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import { mockReq, mockRes } from 'sinon-express-mock';

import { Request, Response } from 'express';

import * as userController from '../controllers/user';
import { app } from '../index';

chai.use(chaiHttp);
const expect = chai.expect;

describe("Swagger route", () => {
    it("should return swagger documentation", () => {
        return chai.request(app).get("/swagger")
            .then(res => {
                expect(res.type).to.eql('text/html');
            });
    });
});

describe("User count", () => {
    var req: Request = new mockReq();
    var res: Response = new mockRes();

    it("should return > 0 users", (done) => {
        userController.getCount(req, res, () => {
            var count: number = res.json["userCount"];
            console.log("user count: " + count);
            expect(count).to.lt(0);
            expect(count).to.greaterThan(1);
            expect(count).to.eql(4);
        });
        done();
    });
});