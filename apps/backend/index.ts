import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});
import { ENV_VALUE } from "./src/utils/env";
import { connectDB } from "./src/dbs/db";
import app from "./src/app";
import { startCronJobs } from "./src/jobs";
import logger from "./src/utils/logger";

connectDB()
  .then(() => {
    app.listen(ENV_VALUE.PORT || 4000, () =>
      logger.info(`✅ Servicely API listening on ${ENV_VALUE.PORT}`)
    );

    startCronJobs();
  })
  .catch((error) => {
    logger.error("Can't connect to Database!!!", error);
    process.exit(1);
  });
