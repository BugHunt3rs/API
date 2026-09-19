import express from "express"

export const chemicalRouter = express.Router()

chemicalRouter.get("/", (_, response) => {
    response.json({message: "chemical router working"})
})