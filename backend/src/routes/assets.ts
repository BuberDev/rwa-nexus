import { Router } from "express";
import { z } from "zod";
import { fetchAllAssets } from "../services/chain";

export const assetRoutes = Router();

assetRoutes.get("/", async (_req, res) => {
  try {
    const assets = await fetchAllAssets();
    res.json({ assets, total: assets.length });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
});

const idSchema = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "Invalid bytes32 ID");

assetRoutes.get("/:id", async (req, res) => {
  const result = idSchema.safeParse(req.params.id);
  if (!result.success) {
    res.status(400).json({ error: "Invalid asset ID format" });
    return;
  }

  try {
    const assets = await fetchAllAssets();
    const asset = assets.find((a) => a.id.toLowerCase() === result.data.toLowerCase());
    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
});
