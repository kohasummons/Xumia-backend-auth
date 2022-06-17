const config = require("../config/auth.config");
const db = require("../models");

const User = db.user;
const Role = db.role;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  user.save((error, user) => {
    if (error) {
      res.status(500).send({ message: error });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (error, roles) => {
          if (error) {
            res.status(500).send({ message: error });
            return;
          }
          user.roles = roles.map((role) => role._id);
          user.save((error) => {
            if (error) {
              res.status(500).send({ message: error });
              return;
            }
          });

          res.send({ message: "User was registered successfully!" });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (error, role) => {
        if (error) {
          res.status(500).send({ message: error });
          return;
        }

        user.roles = [role._id];
        user.save((error) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

//find user in db
// if err, do
// if not found, do

//validate [password]
//roll up token

// define roles
//send response with header

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-__v")
    .exec((error, user) => {
      if (error) {
        res.status(500).send({ message: error });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User not Found." });
      }

      let passwordIsInvalid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsInvalid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      let token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400,
      });

      var authorities = [];
      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE__" + user.roles[i].name.toUpperCase());
      }

      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token,
      });
    });
};
