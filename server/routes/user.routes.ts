// Core Packages
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

// Middleware
import { authorizeRequest } from "@server/middleware/auth";

// Lib
import { HonoVariables } from "@server/types";
import { baseEmailParamsSchema, baseIdParamsSchema } from "@server/lib/schemas";

// Services
import { getUserByEmail, getUserById } from "@server/services/db/user.services";

export default new Hono<{ Variables: HonoVariables }>()
  .get(
    "/:id",
    authorizeRequest,
    zValidator("param", baseIdParamsSchema),
    async function (c) {
      const { id } = c.req.valid("param");

      const requestedUser = await getUserById(id)
        .then(data => {
          if (data === undefined) {
            throw new HTTPException(404, {
              message: "User not found",
              cause: new Error("User not found"),
              res: c.res,
            });
          };

          return data;
        })
        .catch(err => {
          throw new HTTPException(500, {
            message: "Internal server error",
            cause: err,
            res: c.res,
          });
        });

      return c.json({
        message: "User fetched successfully",
        data: {
          user: requestedUser,
        },
      }, {
        status: 200,
      });
    }
  )
  .get(
    "/email/:email",
    authorizeRequest,
    zValidator("param", baseEmailParamsSchema),
    async function (c) {
      const { email } = c.req.valid("param");

      const user = await getUserByEmail(email)
        .then(data => {
          if (data === undefined) {
            throw new HTTPException(404, {
              message: "User not found",
              cause: new Error("User not found"),
              res: c.res,
            });
          }

          return data;
        })
        .catch(err => {
          throw new HTTPException(500, {
            message: "Internal server error",
            cause: err,
            res: c.res,
          });
        });

      return c.json({
        message: "User email fetched successfully",
        data: {
          user,
        },
      });
    }
  );
