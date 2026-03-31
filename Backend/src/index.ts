/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();

const app = require("./app").default;

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`Edyx backend running on http://${HOST}:${PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error("Server startup error:", error.message);
  process.exit(1);
});
