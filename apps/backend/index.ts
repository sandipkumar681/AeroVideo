import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});
import { ENV_VALUE } from "./src/utils/env";
import { connectDB } from "./src/dbs/db";
import { connectRedis } from "./src/dbs/redis";
import app from "./src/app";
import { startCronJobs } from "./src/jobs";

connectDB()
  .then(() => {
    connectRedis();

    app.listen(ENV_VALUE.PORT || 4000, () =>
      console.log(`✅ AeroVideo API listening on ${ENV_VALUE.PORT}`),
    );

    startCronJobs();
  })
  .catch((error) => {
    console.log("Can't connect to Database!!!", error);
    process.exit(1);
  });
