const bcrypt = require("bcryptjs");

async function main() {
  const hash = await bcrypt.hash("245773", 10);
  console.log(hash);
}

main();