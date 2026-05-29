const assert = require("assert");
const http = require("http");

process.env.DB_STORAGE = ":memory:";
process.env.JWT_SECRET = "test-secret";

const app = require("../app");
const sequelize = require("../config/db");

function jsonRequest(server, method, path, body, token) {
  const payload = body ? JSON.stringify(body) : "";
  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return rawRequest(server, method, path, payload, headers);
}

function uploadRequest(server, token, content) {
  const boundary = "----cargo-test-boundary";
  const payload = Buffer.from(
    [
      `--${boundary}`,
      'Content-Disposition: form-data; name="manifest"; filename="manifest.txt"',
      "Content-Type: text/plain",
      "",
      content,
      `--${boundary}--`,
      "",
    ].join("\r\n")
  );

  return rawRequest(server, "POST", "/api/upload", payload, {
    Authorization: `Bearer ${token}`,
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "Content-Length": payload.length,
  });
}

function rawRequest(server, method, path, payload, headers) {
  const { port } = server.address();

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers,
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        });
      }
    );

    req.on("error", reject);
    req.end(payload);
  });
}

async function signup(server, email) {
  const response = await jsonRequest(server, "POST", "/signup", {
    email,
    password: "password123",
  });

  assert.strictEqual(response.status, 201);
  return response.body.token;
}

async function run() {
  await sequelize.sync({ force: true });
  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    instance.on("error", reject);
  });

  try {
    const adminToken = await signup(server, "admin@nebula-corp.com");
    const standardToken = await signup(server, "pilot@example.com");
    const manifest = `[2026-03-29] || CRG-002 :: 17 >> Lunar Outpost Delta
[2026-03-29] || CRG-005 :: 20 >> Sector-7 Mining Rig
[2026-03-29] || CRG-012 :: 100 >> Sector-7 Command Center
[2026-03-29] || CRG-001 :: 500 >> Mars Base Alpha`;

    const forbidden = await uploadRequest(server, standardToken, manifest);
    assert.strictEqual(forbidden.status, 403);
    assert.strictEqual(forbidden.body.error, "Clearance level inadequate.");

    const upload = await uploadRequest(server, adminToken, manifest);
    assert.strictEqual(upload.status, 201);
    assert.strictEqual(upload.body.imported, 2);
    assert.strictEqual(upload.body.skipped, 2);

    const cargo = await jsonRequest(server, "GET", "/api/cargo", null, adminToken);
    assert.strictEqual(cargo.status, 200);
    assert.strictEqual(cargo.body.cargo.length, 2);
    assert.deepStrictEqual(
      cargo.body.cargo.map((record) => record.cargo_code).sort(),
      ["CRG-001", "CRG-012"]
    );
  } finally {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await sequelize.close();
  }
}

run()
  .then(() => {
    console.log("Task 2 cargo API tests passed");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
