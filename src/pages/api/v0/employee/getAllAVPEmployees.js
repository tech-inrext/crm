import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class GetAllAVPEmployeesController extends Controller {
    constructor() {
        super();
        this.service = new EmployeeService();
    }

    async get(req, res) {
        return this.service.getAllAVPEmployees(req, res);
    }
}

export default new GetAllAVPEmployeesController().handler;
