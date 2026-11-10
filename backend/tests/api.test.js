const { randomUUID } = require("node:crypto");
const { test, before, after } = require("node:test");
const assert = require("node:assert");
const app = require("../server");

let server;
let baseURL;

const testAudit = {
    id:  randomUUID(),
    restaurant: "Test Restaurant",
    inspector: "Test Inspector",
    date: "2026-11-10",
    observations: "Test kitchen inspection",
    status: "Pass"
};

before(async () => {
    server = app.listen(0);

    await new Promise(resolve => server.once("listening", resolve));

    baseURL = `http://localhost:${server.address().port}`;
});

after(async () => {
    await new Promise(resolve => server.close(resolve));
});

test("Reject incomplete inspection data", async () => {
    const response = await fetch(`${baseURL}/api/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant: "Test Restaurant" })
    });

    assert.strictEqual(response.status, 400);
});

test("Accept a valid inspection", async () => {
    const response = await fetch(`${baseURL}/api/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testAudit)
    });

    assert.strictEqual(response.status, 201);
});

test("Prevent duplicate inspection records", async () => {
    const response = await fetch(`${baseURL}/api/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testAudit)
    });

    assert.strictEqual(response.status, 200);

    const inspections = await fetch(`${baseURL}/api/inspections`);
    const records = await inspections.json();

    const matchingRecords = records.filter(
        record => record.id === testAudit.id
    );

    assert.strictEqual(matchingRecords.length, 1);
});
