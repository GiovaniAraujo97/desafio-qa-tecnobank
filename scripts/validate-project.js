const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const collection = readJson("postman/demoblaze-api.collection.json");
const environment = readJson("postman/demoblaze-api.environment.json");
const packageJson = readJson("package.json");
const jmx = fs.readFileSync(
  path.join(root, "performance/jmeter/local-baseline.jmx"),
  "utf8",
);

if (collection.info.schema !== "https://schema.getpostman.com/json/collection/v2.1.0/collection.json") {
  throw new Error("Unexpected Postman collection schema");
}

if (collection.item.length !== 11) {
  throw new Error(`Expected 11 Postman requests, found ${collection.item.length}`);
}

const variableNames = new Set(environment.values.map(({ key }) => key));
for (const requiredVariable of ["apiUrl", "password", "phoneId", "monitorId", "computerId"]) {
  if (!variableNames.has(requiredVariable)) {
    throw new Error(`Missing Postman environment variable: ${requiredVariable}`);
  }
}

if (!packageJson.scripts["test:api"]) {
  throw new Error("Missing test:api script");
}

if (!packageJson.scripts["test:api:mock"]) {
  throw new Error("Missing test:api:mock script");
}

const mockApi = fs.readFileSync(
  path.join(root, "mocks/demoblaze-api.js"),
  "utf8",
);
if (!mockApi.includes("new Set([\"1\", \"10\", \"8\"])")) {
  throw new Error("Mock API must provide the product IDs used by the API collection");
}

if (environment.values.find(({ key }) => key === "password")?.value !== "QaTest!12345") {
  throw new Error("Expected the configured fixed QA test password in the Postman environment");
}

if (packageJson.scripts["test:api"].includes("reporter-" + "json-export")) {
  throw new Error("Do not publish raw Newman JSON reports containing request/response data");
}

if (!jmx.includes("<stringProp name=\"HTTPSampler.domain\">127.0.0.1</stringProp>")) {
  throw new Error("The JMeter demonstration must stay bound to localhost");
}

if (!jmx.includes("<stringProp name=\"ThreadGroup.num_threads\">1</stringProp>")) {
  throw new Error("The JMeter demonstration must remain limited to one virtual user");
}

console.log("Project configuration validated.");
console.log(`Postman collection: ${collection.item.length} requests.`);
console.log("Local API mock and dynamic test data validated.");
console.log("JMeter example: loopback target and one virtual user.");
