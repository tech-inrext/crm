export class Migration {
  constructor() {
    this.workerMap = {};
  }
  addMigration(name, cb) {
    this.workerMap[name] = cb;
  }
  run(name) {
    const cb = this.workerMap[name];
    if (!cb) {
      throw new Error(
        `Migration "${name}" not found. Available migrations: ${Object.keys(
          this.workerMap
        ).join(", ")}`
      );
    }
    cb();
  }
}
