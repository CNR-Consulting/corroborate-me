# Contributing

This repository is the public **catalog** for CorroborateMe MCP: README, `server.json`, and the tool schema stub in `src/server.ts`.

The hosted product is not developed here. Pull requests that add production Worker code, credentials, or a second live MCP URL will be declined.

## Welcome changes

- Doc fixes (install snippets, tool descriptions, links)
- Schema drift: tool **names**, descriptions, and input shapes must match the hosted server at `https://corroborateme.com/mcp`
- Registry metadata in `server.json` (`remotes[0].url` is `https://corroborateme.com/mcp/`, the same production MCP route as `https://corroborateme.com/mcp`; registry name is `com.corroborateme/corroborate-me`)

## MCP Registry publish

Publishing uses **DNS domain auth** for `corroborateme.com`. CI needs the `MCP_REGISTRY_KEY_CORROBORATEME` repository secret (Ed25519 private key hex, never commit it). Do not publish unless maintainers explicitly ask.

## Schema stub

[`src/server.ts`](src/server.ts) exists so crawlers can detect `server.tool(...)` registrations. Handlers only point at the hosted URL. Do not implement auth, billing, or login-links here.

[`src/main.ts`](src/main.ts) wires the stub to stdio transport for directory introspection only. It is not a second live MCP endpoint.

## License

Contributions are accepted under the [MIT License](./LICENSE).
