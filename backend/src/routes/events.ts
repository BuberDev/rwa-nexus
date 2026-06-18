import { Router } from "express";
import { z } from "zod";
import { fetchTransferEvents } from "../services/chain";

export const eventsRoutes = Router();

const querySchema = z.object({
  token: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid token address"),
  fromBlock: z.coerce.number().int().nonnegative().optional().default(0),
});

eventsRoutes.get("/transfers", async (req, res) => {
  const result = querySchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  try {
    const events = await fetchTransferEvents(result.data.token, result.data.fromBlock);
    res.json({ events, total: events.length });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
});
