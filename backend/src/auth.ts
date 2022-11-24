import { RequestHandler } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import cookie from 'cookie'
import { key } from './secrets';

export const verifyToken: RequestHandler = (req, res, next) => {
  const token = cookie.parse(req.headers.cookie ?? '').token

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, key);
    req.body.user = decoded as JwtPayload;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export const optionalToken: RequestHandler = (req, res, next) => {
  const token = cookie.parse(req.headers.cookie ?? '').token

  if (token) {
    try {
      const decoded = jwt.verify(token, key);
      req.body.user = decoded as JwtPayload;
    } catch (err) {}
  }
  return next();
};