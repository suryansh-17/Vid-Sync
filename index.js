import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";
import serverless from "serverless-http";

dotenv.config({
  path: "./env",
});

let conn = null;

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (conn == null) {
    conn = await connectDB();
  }
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};
