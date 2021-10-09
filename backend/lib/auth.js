"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.optionalToken = exports.verifyToken = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var cookie_1 = __importDefault(require("cookie"));
var verifyToken = function (req, res, next) {
    var _a;
    var token = cookie_1["default"].parse((_a = req.headers.cookie) !== null && _a !== void 0 ? _a : '').token;
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        var decoded = jsonwebtoken_1["default"].verify(token, "superSecretKeyThatNoOneElseKnows");
        req.body.user = decoded;
    }
    catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};
exports.verifyToken = verifyToken;
var optionalToken = function (req, res, next) {
    var _a;
    var token = cookie_1["default"].parse((_a = req.headers.cookie) !== null && _a !== void 0 ? _a : '').token;
    if (token) {
        try {
            var decoded = jsonwebtoken_1["default"].verify(token, "superSecretKeyThatNoOneElseKnows");
            req.body.user = decoded;
        }
        catch (err) { }
    }
    return next();
};
exports.optionalToken = optionalToken;
