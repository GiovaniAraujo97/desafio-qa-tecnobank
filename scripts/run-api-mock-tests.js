const fs = require("node:fs");
const path = require("node:path");
const newman = require("newman");
const { createDemoblazeMockServer } = require("../mocks/demoblaze-api");

const root = path.resolve(__dirname, "..");
const reportsDirectory = path.join(root, "reports");
const collectionPath = path.join(root, "postman/demoblaze-api.collection.json");
const environmentPath = path.join(root, "postman/demoblaze-api.environment.json");
const reportPath = path.join(reportsDirectory, "newman-mock-results.xml");

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server.address());
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function runCollection(options) {
  return new Promise((resolve, reject) => {
    newman.run(options, (error, summary) => {
      if (error) reject(error);
      else resolve(summary);
    });
  });
}

async function main() {
  fs.mkdirSync(reportsDirectory, { recursive: true });

  const server = createDemoblazeMockServer();
  const address = await listen(server);

  try {
    const environment = JSON.parse(fs.readFileSync(environmentPath, "utf8"));
    const apiUrl = `http://127.0.0.1:${address.port}`;
    const apiUrlVariable = environment.values.find(({ key }) => key === "apiUrl");

    if (!apiUrlVariable) {
      throw new Error("Postman environment is missing the apiUrl variable.");
    }

    apiUrlVariable.value = apiUrl;
    console.log(`Running the Postman collection against local mock ${apiUrl}`);

    const summary = await runCollection({
      collection: JSON.parse(fs.readFileSync(collectionPath, "utf8")),
      environment,
      reporters: ["cli", "junit"],
      reporter: {
        junit: {
          export: reportPath,
        },
      },
    });

    const { assertions, requests } = summary.run.stats;
    console.log(
      `Mock API results: ${requests.failed} failed requests; ${assertions.total - assertions.failed}/${assertions.total} assertions passed.`,
    );

    if (requests.failed > 0 || assertions.failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    await close(server);
  }
}

main().catch((error) => {
  console.error("Local mock API tests failed:", error);
  process.exitCode = 1;
});
