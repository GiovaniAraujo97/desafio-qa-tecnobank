const crypto = require("node:crypto");
const http = require("node:http");

const products = new Set(["1", "10", "8"]);
const users = new Map();
const tokens = new Map();
const carts = new Map();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

async function handleRequest(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { errorMessage: "Method not allowed." });
    return;
  }

  let payload;
  try {
    payload = await readJson(request);
  } catch {
    sendJson(response, 400, { errorMessage: "Invalid JSON." });
    return;
  }

  if (request.url === "/signup") {
    if (!payload.username || !payload.password) {
      sendJson(response, 200, { errorMessage: "Please fill out Username and Password." });
      return;
    }

    if (users.has(payload.username)) {
      sendJson(response, 200, { errorMessage: "This user already exist." });
      return;
    }

    users.set(payload.username, payload.password);
    sendJson(response, 200, "");
    return;
  }

  if (request.url === "/login") {
    if (!users.has(payload.username)) {
      sendJson(response, 200, { errorMessage: "User does not exist." });
      return;
    }

    if (users.get(payload.username) !== payload.password) {
      sendJson(response, 200, { errorMessage: "Wrong password." });
      return;
    }

    const token = `mock_${crypto.randomUUID()}`;
    tokens.set(token, payload.username);
    sendJson(response, 200, `Auth_token: ${token}`);
    return;
  }

  if (request.url === "/addtocart") {
    if (!tokens.has(payload.cookie)) {
      sendJson(response, 200, { errorMessage: "Bad parameter, token malformed." });
      return;
    }

    const productId = String(payload.prod_id);
    if (!products.has(productId)) {
      sendJson(response, 200, { errorMessage: "Product not found." });
      return;
    }

    const items = carts.get(payload.cookie) || [];
    items.push({
      cookie: payload.cookie,
      id: payload.id || crypto.randomUUID(),
      prod_id: productId,
    });
    carts.set(payload.cookie, items);
    sendJson(response, 200, "");
    return;
  }

  if (request.url === "/viewcart") {
    if (!tokens.has(payload.cookie)) {
      sendJson(response, 200, { errorMessage: "Bad parameter, token malformed." });
      return;
    }

    sendJson(response, 200, { Items: carts.get(payload.cookie) || [] });
    return;
  }

  if (request.url === "/deleteitem") {
    for (const [token, items] of carts) {
      const itemIndex = items.findIndex((item) => item.id === payload.id);
      if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
        carts.set(token, items);
        sendJson(response, 200, "Item deleted.");
        return;
      }
    }

    sendJson(response, 200, { errorMessage: "Unable to delete item." });
    return;
  }

  sendJson(response, 404, { errorMessage: "Endpoint not found." });
}

function createDemoblazeMockServer() {
  return http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      console.error("Mock API request failed:", error);
      if (!response.headersSent) {
        sendJson(response, 500, { errorMessage: "Mock API internal error." });
      } else {
        response.destroy(error);
      }
    });
  });
}

module.exports = { createDemoblazeMockServer };
