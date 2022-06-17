const { verify } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { user } = require("../models");
const db = require("../models");

const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token Provided!" });
  }

  jwt.verify(token, config.secret, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    // load decoded.id into request
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((error, user) => {
    if (error) {
      res.status(500).send({ message: error });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (error, roles) => {
        if (error) {
          res.status(500).send({ message: error });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }
        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
};

isModerator = (req, res, next) => {
  user.findById(req.userId).exec((error, user) => {
    if (error) {
      res.status(500).send({ message: error });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (error, roles) => {
        if (error) {
          res.status(500).send({ message: error });
          return;
        }

        roles.map((role) => {
          if (role.name === "moderator") {
            next();
            return;
          }
        });
        res.status(403).send({ message: "Require Moderator Role!" });
        return;
      }
    );
  });
};


const authJwt = {
    verifyToken,
    isAdmin,
    isModerator
};

module.exports = authJwt;
