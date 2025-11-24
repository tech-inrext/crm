//crm/src/middlewwares/Controller.js
import { userAuth } from "../middlewares/auth";

const methodNotAllowed = (res) => {
  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};
export class Controller {
  constructor() {
    this.handler = this.handler.bind(this);
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.delete = this.delete.bind(this);
    this.patch = this.patch.bind(this);
    this.skipAuth = [];
    this.before = null;
  }
  get(req, res) {
    return methodNotAllowed(res);
  }
  post(req, res) {
    return methodNotAllowed(res);
  }
  put(req, res) {
    return methodNotAllowed(res);
  }
  delete(req, res) {
    return methodNotAllowed(res);
  }
  patch(req, res) {
    return methodNotAllowed(res);
  }

  handler(req, res) {
    const method = req.method.toLowerCase();
    const fun = this[method];
    if (typeof fun !== "function") {
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
    }

    if (this.skipAuth.includes(method)) {
      return fun(req, res);
    } else {
      return userAuth(req, res, fun);
    }
  }
}
