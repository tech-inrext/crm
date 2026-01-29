//crm/src/middlewwares/Controller.js
import { userAuth } from "../be/middlewares/auth";
import { Controller as BaseController } from "inrext-framework";

export class Controller extends BaseController {
  constructor() {
    super();
    this.userAuth = userAuth;
  }
}