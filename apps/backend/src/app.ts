import express, { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ENV_VALUE } from "./utils/env";

const app = express();

app.use(
  cors({
    origin: ENV_VALUE.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

// Routes import
import userRouter from "./routes/user.routes";
import videoRouter from "./routes/video.routes";
import commentRouter from "./routes/comment.routes";
import likeRouter from "./routes/like.routes";
import subscriptionRouter from "./routes/subscription.routes";
// import playlistRouter from "./routes/playlist.routes";
import healthCheckRouter from "./routes/healthcheck.routes";
import dashboardRouter from "./routes/dashboard.routes";
import sendMail from "./controllers/sendmail.controllers";
import { ApiResponse } from "./utils/apiResponse";

// Routes declaration
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
// app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Send email route
app.post("/api/v1/send-email", sendMail);

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "File is too large"));
    }
  }

  if (err.statusCode >= 500) {
    console.error(err);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal Server Error!"));
  }

  return res
    .status(err.statusCode || 500)
    .json(
      new ApiResponse(
        err.statusCode || 500,
        {},
        err.message || "An error occurred"
      )
    );
});

export default app;
