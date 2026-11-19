const fs = require("node:fs");

fs.mkdirSync("reports", { recursive: true });

module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    require: [
      "features/support/**/*.js",
      "features/step_definitions/**/*.js",
    ],
    format: [
      "progress-bar",
      "html:reports/cucumber-report.html",
    ],
    publishQuiet: true,
  },
};
