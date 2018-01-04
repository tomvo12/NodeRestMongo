import { Request, Response, NextFunction } from "express";
import { default as User, UserModel } from "../models/User";

import * as appInsights from 'applicationinsights';

export let getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var user = await User.findOne({ UPN: req.params.upn }).exec();
        if(!user){
            console.log("user not found!");
            res.status(404).json({ msg: `User ${req.params.upn} was not found!` });
            return next();
        }
        res.json(user);
        return next();
    } catch (err) {
        console.log("user not found: " + err);
        res.status(404).json({ msg: `User ${req.params.upn} was not found!` });
        return next();
    }
};

export let getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    req.query.take && req.assert("take", "take query parameter is not valid").isInt();
    req.query.skip && req.assert("skip", "skip query parameter is not valid").isInt();
    req.query.sortOrder && req.assert("sortOrder", "sortOrder query parameter is not valid").isIn(["asc", "desc"]);
    req.query.sort && req.assert("sort", "sort query parameter is not valid").isIn(["UPN", "Email", "DisplayName", "LicenseType"]);

    const errors = req.validationErrors();
    if (errors) {
        res.status(400).json(errors);
        return next();
    }

    var maxCount = 50;
    if (req.query.take) {
        maxCount = Math.min(req.query.take, maxCount);
    }
    var skip = 0;
    if (req.query.skip) {
        skip = req.query.skip;
    }

    var sortOrder = 'asc';
    if (req.query.sortOrder)
        sortOrder = req.query.sortOrder;

    var sort = {};
    if (req.query.sort) {
        sort[req.query.sort] = sortOrder;
    } else {
        sort["UPN"] = sortOrder;
    }

    try {
        let users = await User.find()
            .limit(maxCount)
            .skip(skip)
            .sort(sort)
            .exec();
        let count = await User.count({}).exec();
        res.json({
            users: [...users],
            skip: skip,
            take: maxCount,
            totalCount: count
        });
        return next();
    } catch (err) {
        console.log("Error fetching users: " + err);
        res.status(500).send("Failed to read users list.");
        return next();
    }
};

export let getCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var count = await User.count({}).exec();
        res.json({ userCount: count });
        return;
    } catch (err) {
        console.log("Failed to read count from collection " + err);
        res.status(500).send("Failed to read count from collection");
        return next();
    }
};

export let postUser = async (req, res, next) => {
    req.assert("Email", "Email is not valid").isEmail();
    req.assert("UPN", "UPN is not valid").isEmail();
    req.assert("LicenseType", "Invalid license type (allowed values are 'Basic' or 'Stakeholder'").isIn(["Basic", "Stakeholder"]);
    req.assert("DisplayName", "DisplayName cannot be blank").notEmpty();
    req.sanitize("Email").normalizeEmail({ gmail_remove_dots: false });
    req.sanitize("UPN").normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        res.status(400).json(errors);
        return next();
    }

    if(req.body.UPN.includes("hans")) {
        appInsights.defaultClient.trackException(
            {
                exception: new Error("Failed to create user!")});
        res.status(500).json({ msg: "Unhandled exception!"});
        return next();
    }
    
    const user = new User({
        UPN: req.body.UPN,
        Email: req.body.Email,
        DisplayName: req.body.DisplayName,
        LicenseType: req.body.LicenseType,
    });

    try {
        var existingUser = await User.findOne({ UPN: req.body.UPN }).exec();
        if (existingUser) {
            res.status(400).json({ msg: "Account with that UPN already exists." });
            return next();
        }

        await user.save();
        res.json(user);
        return next();
    }
    catch (err) {
        console.log("Error saving user: " + err);
        return next(err);
    }
};

export let putUser = async (req, res, next) => {
    req.assert("Email", "Email is not valid").isEmail();
    req.assert("UPN", "UPN is not valid").isEmail();
    // req.assert("UPN", "UPN must be the same as in URL").is(req.params.upn);
    req.assert("LicenseType", "Invalid license type (allowed values are 'Basic' or 'Stakeholder'").isIn(["Basic", "Stakeholder"]);
    req.assert("DisplayName", "DisplayName cannot be blank").notEmpty();
    req.sanitize("Email").normalizeEmail({ gmail_remove_dots: false });
    req.sanitize("UPN").normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        res.status(400).json(errors);
        return next();
    }

    try {
        var existingUser = await User.findOne({ UPN: req.params.upn }).exec();
        if (!existingUser) {
            res.status(404).json({ msg: `User ${req.params.upn} was not found!` });
            return next();
        }

        existingUser.Email = req.body.Email;
        existingUser.DisplayName = req.body.DisplayName;
        existingUser.LicenseType = req.body.LicenseType;

        await existingUser.save();
        res.json(existingUser);
        return next();
    }
    catch (err) {
        return next(err);
    }
}

export let deleteUser = async (req, res, next) => {
    try {
        var existingUser = await User.findOne({ UPN: req.params.upn }).exec();
        if (!existingUser) {
            res.status(404).json({ msg: `User ${req.params.upn} was not found!` });
            return next();
        }

        await existingUser.collection.deleteOne({ UPN: req.params.upn });
        res.status(204).json({msg: "User deleted successfully"});
        return next();
    }
    catch (err) {
        return next(err);
    }
}