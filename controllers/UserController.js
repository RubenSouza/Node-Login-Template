const mongoose = require("mongoose");
const User = mongoose.model("User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const UserController = {
  //POST REGISTER

  async register(req, res) {
    const { username, email, password } = req.body;

    let encryptedPassword = CryptoJS.AES.encrypt(
      password,
      process.env.SECRET_KEY
    ).toString();
    try {
      const user = await User.create({
        username,
        email,
        password: encryptedPassword,
      });

      const { password, ...info } = user._doc;

      return res.json(info);
    } catch (err) {
      console.log(err);
      return res.status(400).send("Registration failed");
    }
  },

  //POST LOGIN

  async login(req, res) {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) return res.status(401).send("Wrong email or password");

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    if (originalText !== password)
      return res.status(401).send("Wrong email or password");

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "5d" }
    );

    const { password: dbPassword, ...info } = user._doc;

    return res.status(200).json({ ...info, accessToken });
  },

  //PUT UPDATE

  async update(req, res, next) {
    const { username, email, password } = req.body;

    let encryptedPassword = CryptoJS.AES.encrypt(
      password,
      process.env.SECRET_KEY
    ).toString();

    try {
      let user = await User.findById(req.payload.id);

      if (!user) {
        return res.status(401).json({ errors: "Usuário não registrado" });
      }
      if (typeof username !== "undefined") {
        user.username = username;
      }
      if (typeof email !== "undefined") {
        user.email = email;
      }
      if (typeof password !== "undefined") {
        user.password = encryptedPassword;
      }

      try {
        let newUser = await user.save();
        const { password, ...info } = newUser._doc;

        return res.status(200).json({ info });
      } catch (error) {
        return res.status(401).json({ errors: "Usuário não registrado" });
      }
    } catch (error) {
      return res
        .status(401)
        .json({ errors: "Não foi possível salvar o usuário" });
    }
  },

  async delete(req, res, next) {
    try {
      let user = await User.findById(req.payload.id);
      if (!user) {
        return res.status(401).json({ errors: "Usuário não registrado" });
      }
      return user
        .remove()
        .then(() => {
          return res.json({ deletado: true });
        })
        .catch(next);
    } catch (error) {}
  },

  async index(req, res, next) {
    try {
      let user = await User.findById(req.payload.id);
      if (!user) {
        return res.status(401).json({ errors: "Usuário não registrado" });
      }
      const { password, ...info } = user._doc;
      return res.json({ info });
    } catch (error) {
      return res.status(401).json({ errors: error });
    }
  },
};

module.exports = UserController;
