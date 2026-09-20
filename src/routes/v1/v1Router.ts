import express from "express";

export const v1Router = express.Router();

v1Router.get("/", (_, response) => {
  response.json({ message: "V1 Router Working" });
});

export default v1Router;
