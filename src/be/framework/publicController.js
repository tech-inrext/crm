import { Controller as BaseController } from "inrext-framework";

export class PublicController extends BaseController {
  constructor() {
    super();
    this.skipAuth = ["get", "post", "put", "delete"];
  }
}

