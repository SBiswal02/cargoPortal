const assert = require("assert");
const http = require("http");

process.env.DB_STORAGE = ":memory:";
process.env.JWT_SECRET = "test-secret";

const app = require("../app");
const sequelize = require("../config/db");

function request(server, method, path, body) {
  const payload = body ? JSON.stringify(body) : "";
  const { port } = server.address();

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
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

async function run() {
  await sequelize.sync({ force: true });
  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    instance.on("error", reject);
  });

  try {
    const adminSignup = await request(server, "POST", "/signup", {
      name: "Nova Admin",
      email: "nova@nebula-corp.com",
      password: "password123",
      role: "Standard",
    });

    assert.strictEqual(adminSignup.status, 201);
    assert.strictEqual(adminSignup.body.user.role, "Admin");
    assert.ok(adminSignup.body.token);

    const standardSignup = await request(server, "POST", "/signup", {
      name: "Orbit User",
      email: "orbit@example.com",
      password: "password123",
      role: "Admin",
    });

    assert.strictEqual(standardSignup.status, 201);
    assert.strictEqual(standardSignup.body.user.role, "Standard");

    const trickyDomainSignup = await request(server, "POST", "/signup", {
      email: "ops@nebula-corp.com.example",
      password: "password123",
    });

    assert.strictEqual(trickyDomainSignup.status, 201);
    assert.strictEqual(trickyDomainSignup.body.user.role, "Standard");

    const login = await request(server, "POST", "/login", {
      email: "nova@nebula-corp.com",
      password: "password123",
    });

    assert.strictEqual(login.status, 200);
    assert.strictEqual(login.body.user.role, "Admin");
    assert.ok(login.body.token);

    console.log("Auth tests passed");
  } finally {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await sequelize.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
