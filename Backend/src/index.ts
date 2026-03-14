/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();

const app = require("./app").default;

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Edyx backend running on http://localhost:${PORT}`);
});
