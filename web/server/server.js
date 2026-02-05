import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 4000;

const LOCATION_ENDPOINT =
  "https://ttp.cbp.dhs.gov/schedulerapi/locations/?temporary=false&inviteOnly=false&operational=true&serviceName=Global%20Entry";

app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/locations", async (req, res) => {
  try {
    const response = await fetch(LOCATION_ENDPOINT);
    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch locations" });
    }
    const data = await response.json();
    const locations = data
      .map((loc) => ({
        id: loc.id,
        name: loc.name,
        shortName: loc.shortName,
        tzData: loc.tzData,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ locations });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error fetching locations" });
  }
});

app.get("/api/slots", async (req, res) => {
  const { locationId, startDate, endDate } = req.query;

  if (!locationId || !startDate || !endDate) {
    return res.status(400).json({
      error: "locationId, startDate, and endDate are required",
    });
  }

  const appointmentUrl = `https://ttp.cbp.dhs.gov/schedulerapi/locations/${locationId}/slots?startTimestamp=${startDate}T00:00:00&endTimestamp=${endDate}T00:00:00`;

  try {
    const response = await fetch(appointmentUrl);
    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch slots" });
    }

    const data = await response.json();
    const slots = data
      .filter((slot) => slot.active > 0)
      .sort((a, b) => {
        const aTime = new Date(a.timestamp || a.startTimestamp || 0).getTime();
        const bTime = new Date(b.timestamp || b.startTimestamp || 0).getTime();
        return aTime - bTime;
      });

    res.json({
      locationId,
      startDate,
      endDate,
      total: slots.length,
      slots,
    });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error fetching slots" });
  }
});

app.listen(PORT, () => {
  console.log(`Global Entry Drops API running on http://localhost:${PORT}`);
});
