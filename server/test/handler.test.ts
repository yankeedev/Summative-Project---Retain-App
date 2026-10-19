import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it, mock } from "node:test";

// Must be set before the handler module is imported: the Express app reads
// CLIENT_ORIGIN once at import time.
process.env.NODE_ENV = "test";
process.env.CLIENT_ORIGIN =
  "http://localhost:5173,https://staging.example.test,https://*-yankeedev.vercel.app";

type Handler = (
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse
) => Promise<void>;

type CreateHandler = (connect?: () => Promise<void>) => Handler;

interface Harness {
  url: string;
  close: () => Promise<void>;
}

async function startServer(handler: Handler): Promise<Harness> {
  const server: Server = createServer((req, res) => {
    void handler(req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

const noopConnect = async (): Promise<void> => {};

describe("serverless handler", () => {
  let createHandler: CreateHandler;
  let normalizeUrl: (raw: string) => string;
  const harnesses: Harness[] = [];

  before(async () => {
    const mod = await import("../api/index");
    createHandler = mod.createHandler;
    normalizeUrl = mod.normalizeUrl;
  });

  after(async () => {
    await Promise.all(harnesses.map((harness) => harness.close()));
  });

  async function serve(connect: () => Promise<void> = noopConnect): Promise<string> {
    const harness = await startServer(createHandler(connect));
    harnesses.push(harness);
    return harness.url;
  }

  describe("normalizeUrl", () => {
    it("prefixes routes that arrive without /api", () => {
      assert.equal(normalizeUrl("/health"), "/api/health");
      assert.equal(normalizeUrl("health"), "/api/health");
      assert.equal(normalizeUrl("/"), "/api/");
      assert.equal(normalizeUrl(""), "/api/");
      assert.equal(normalizeUrl("/expenses?limit=5"), "/api/expenses?limit=5");
    });

    it("leaves already-prefixed URLs untouched", () => {
      assert.equal(normalizeUrl("/api"), "/api");
      assert.equal(normalizeUrl("/api/health"), "/api/health");
      assert.equal(normalizeUrl("/api?x=1"), "/api?x=1");
      assert.equal(normalizeUrl("/api/auth/signin"), "/api/auth/signin");
    });
  });

  it("serves GET /api/health", async () => {
    const url = await serve();
    const res = await fetch(`${url}/api/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { status: string; uptime: number };
    assert.equal(body.status, "ok");
    assert.equal(typeof body.uptime, "number");
  });

  it("serves GET /health by normalizing to /api/health", async () => {
    const url = await serve();
    const res = await fetch(`${url}/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { status: string };
    assert.equal(body.status, "ok");
  });

  it("returns 503 JSON when the database is unavailable", async () => {
    const errorMock = mock.method(console, "error", () => {});
    try {
      const url = await serve(async () => {
        throw new Error("no database");
      });
      const res = await fetch(`${url}/api/health`);
      assert.equal(res.status, 503);
      assert.match(res.headers.get("content-type") ?? "", /application\/json/);
      assert.deepEqual(await res.json(), { message: "Database unavailable" });
      assert.equal(errorMock.mock.callCount(), 1);
    } finally {
      errorMock.mock.restore();
    }
  });

  it("connects once for concurrent cold-start requests", async () => {
    let calls = 0;
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const connect = async (): Promise<void> => {
      calls += 1;
      await gate;
    };

    const url = await serve(connect);
    const pending = Promise.all([
      fetch(`${url}/api/health`),
      fetch(`${url}/api/health`),
      fetch(`${url}/health`),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(calls, 1, "connect should be shared while in flight");

    release();
    const responses = await pending;
    for (const res of responses) assert.equal(res.status, 200);
  });

  it("reconnects on a later invocation after a failure", async () => {
    let calls = 0;
    const url = await serve(async () => {
      calls += 1;
      throw new Error("still down");
    });

    const errorMock = mock.method(console, "error", () => {});
    try {
      const first = await fetch(`${url}/api/health`);
      const second = await fetch(`${url}/api/health`);
      assert.equal(first.status, 503);
      assert.equal(second.status, 503);
      assert.equal(calls, 2);
    } finally {
      errorMock.mock.restore();
    }
  });

  describe("CORS", () => {
    async function preflight(origin: string): Promise<Response> {
      const url = await serve();
      return fetch(`${url}/api/health`, {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "GET",
        },
      });
    }

    it("allows an exact configured origin", async () => {
      const res = await preflight("https://staging.example.test");
      assert.equal(res.status, 204);
      assert.equal(
        res.headers.get("access-control-allow-origin"),
        "https://staging.example.test"
      );
      assert.equal(res.headers.get("access-control-allow-credentials"), "true");
    });

    it("allows a Vercel preview origin through the wildcard entry", async () => {
      const origin = "https://retain-app-git-main-yankeedev.vercel.app";
      const res = await preflight(origin);
      assert.equal(res.status, 204);
      assert.equal(res.headers.get("access-control-allow-origin"), origin);
    });

    it("allows a localhost dev origin", async () => {
      const res = await preflight("http://localhost:5173");
      assert.equal(res.status, 204);
      assert.equal(
        res.headers.get("access-control-allow-origin"),
        "http://localhost:5173"
      );
    });

    it("does not allow an unlisted origin", async () => {
      const res = await preflight("https://evil.example.test");
      assert.equal(res.headers.get("access-control-allow-origin"), null);
    });

    it("does not allow a lookalike of the wildcard entry", async () => {
      const res = await preflight("https://retain-app-someoneelse.vercel.app");
      assert.equal(res.headers.get("access-control-allow-origin"), null);
    });
  });
});
