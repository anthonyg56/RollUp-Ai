import { authorizeRequest } from "@server/middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { uuidSchema } from "@server/lib/schemas";
import { getAssetById } from "@server/services/db/assets.services";
import { HonoVariables } from "@server/types";
import { Hono } from "hono";
import { z } from "zod";

export default new Hono<{ Variables: HonoVariables }>()
  .get(
    "/:id",
    authorizeRequest,
    zValidator("param", z.object({
      id: uuidSchema,
    })),
    async (c) => {
      const { id } = c.req.valid("param");

      const asset = await getAssetById(id);

      return c.json({
        message: "Asset fetched successfully",
        data: {
          asset,
        }
      });
    }
  )
