import { loginAuth } from "../middlewares/loginAuth.js";
import { Controller as BaseController } from "inrext-framework";

export class LoginController extends BaseController {
  constructor() {
    super();
    this.userAuth = loginAuth;
  }
}

