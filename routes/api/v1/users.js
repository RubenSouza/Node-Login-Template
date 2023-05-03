const router = require("express").Router();
const UserController = require("../../../controllers/UserController");
const auth = require("../../auth");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.put("/", auth.required, UserController.update);
router.delete("/", auth.required, UserController.delete);
router.get("/", auth.required, UserController.index);

module.exports = router;
