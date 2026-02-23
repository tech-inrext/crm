import fs from "fs";
import path from "path";

class Generators {
  constructor() {
    this.name = "Generators";
    this.basePath = path.join(process.cwd(), "src/pages");
  }

  generateController(routePath, options = {}) {
    // routePath: "api/v0/vendor-booking/[id]"

    // Extract controller name from path (e.g., "[id]" -> "Id", "vendor-booking" -> "VendorBooking")
    const segments = routePath.split("/");
    const fileName = segments.pop(); // "[id]" or "index"
    const controllerName = this.toClassName(routePath);

    // Build full file path
    const fullPath = path.join(this.basePath, routePath + ".js");
    const dirPath = path.dirname(fullPath);

    // If controller already exists, don't add/overwrite anything
    if (fs.existsSync(fullPath)) {
      console.log(`⏭️  Skipped (already exists): ${fullPath}`);
      return;
    }

    // Create directories if they don't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
    }

    // Generate controller content
    const template = this.getControllerTemplate(
      controllerName,
      options.get,
      options.post,
      options.put,
      options.patch,
      options.del
    );

    // Write file
    fs.writeFileSync(fullPath, template);
    console.log(`✅ Created controller: ${fullPath}`);
  }

  fileType(fileName) {
    if (
      /^\[(?:\.\.\.)?[a-zA-Z0-9]+\]$|^\[\[\.\.\.[a-zA-Z0-9]+\]\]$/.test(
        fileName
      )
    ) {
      return "params";
    }
    if (fileName === "index") {
      return "index";
    }
    return "";
  }
  toClassName(routePath) {
    const segments = routePath.split("/");
    let fileName = segments.pop();
    let fileType = "";

    while (this.fileType(fileName) && segments.length > 0) {
      if (!fileType) {
        fileType = this.fileType(fileName);
      }
      fileName = segments.pop();
    }

    if (fileType === "params") {
      fileName = fileName + "ById";
    } else if (fileType === "index") {
    }

    return this.toPascalCase(fileName) + "Controller";
  }

  toPascalCase(str) {
    return str
      .replace(/[\[\]]/g, "") // Remove brackets if any
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  normalizeRoutePath(routePath) {
    const normalized = String(routePath || "")
      .trim()
      .replace(/^\/+/, "")
      .replace(/\.js$/, "");

    // If user passes "vendor-booking/[id]" assume api/v0 by default
    if (!normalized.startsWith("api/")) {
      return path.posix.join("api", "v0", normalized);
    }

    return normalized;
  }

  parseWithArg(withArg) {
    const allowed = new Set(["get", "post", "put", "patch", "delete", "del"]);
    const raw = String(withArg || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const methods = raw.filter((m) => allowed.has(m));
    return methods.length ? methods : ["get"];
  }

  getControllerTemplate(
    controllerName,
    get = true,
    post = false,
    put = false,
    patch = false,
    del = false
  ) {
    return `import { Controller } from "@framework";
class ${controllerName} extends Controller {
  constructor() {
    super();
    this.service = null;
    this.skipAuth = [];
  }
  ${get ? "async get(req, res) {\n return this.service.get(req, res);\n }" : ""}
    ${post
        ? "async post(req, res) {\n return this.service.post(req, res);\n }"
        : ""
      }
    ${put
        ? "async put(req, res) {\n return this.service.put(req, res);\n }"
        : ""
      }
    ${patch
        ? "async patch(req, res) {\n return this.service.patch(req, res);\n }"
        : ""
      }
    ${del
        ? "async delete(req, res) {\n return this.service.delete(req, res);\n }"
        : ""
      }
  }
  
  export default new ${controllerName}().handler;`;
  }

  generate() {
    const args = process.argv.slice(2);

    // New CLI style:
    // yarn generate controller --path="vendor-booking/[id]" --with=get,put,patch,delete
    // Old CLI style (back-compat):
    // yarn generate --controller --path="api/v0/vendor-booking/[id]" --get --post ...
    const hasController =
      args.includes("controller") || args.includes("--controller");

    const pathArgEq = args.find((arg) => arg.startsWith("--path="));
    const pathArgIndex = args.findIndex((arg) => arg === "--path");
    const pathValueRaw =
      (pathArgEq ? pathArgEq.split("=").slice(1).join("=") : null) ||
      (pathArgIndex >= 0 ? args[pathArgIndex + 1] : null);

    const withArgEq = args.find((arg) => arg.startsWith("--with="));
    const withArgIndex = args.findIndex((arg) => arg === "--with");
    const withValue =
      (withArgEq ? withArgEq.split("=").slice(1).join("=") : null) ||
      (withArgIndex >= 0 ? args[withArgIndex + 1] : null);

    const cliGet = args.includes("--get");
    const cliPost = args.includes("--post");
    const cliPut = args.includes("--put");
    const cliPatch = args.includes("--patch");
    const cliDel = args.includes("--delete") || args.includes("--del");
    const hasAnyMethodFlag = cliGet || cliPost || cliPut || cliPatch || cliDel;

    if (!pathValueRaw) {
      console.error("❌ Please provide --path=<route-path>");
      process.exit(1);
    }

    if (hasController) {
      const routePath = this.normalizeRoutePath(pathValueRaw);

      let options;
      if (withValue) {
        const methods = this.parseWithArg(withValue);
        options = {
          get: methods.includes("get"),
          post: methods.includes("post"),
          put: methods.includes("put"),
          patch: methods.includes("patch"),
          del: methods.includes("delete") || methods.includes("del"),
        };
      } else if (hasAnyMethodFlag) {
        options = {
          get: cliGet,
          post: cliPost,
          put: cliPut,
          patch: cliPatch,
          del: cliDel,
        };
      } else {
        options = {
          get: true,
          post: false,
          put: false,
          patch: false,
          del: false,
        };
      }

      this.generateController(routePath, options);
    }
  }
}

const generators = new Generators();
generators.generate();
