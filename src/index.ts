import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

type SaturationPoint = {
  pressure: number;
  v_liq: number;
  v_vap: number;
};

const saturationData: SaturationPoint[] = [
  { pressure: 0.05, v_liq: 0.00105, v_vap: 0.03 },
  { pressure: 10, v_liq: 0.0035, v_vap: 0.0035 },
];

const SYSTEM_CODES: Record<string, string> = {
  navigation: "NAV-01",
  communications: "COM-02",
  life_support: "LIFE-03",
  engines: "ENG-04",
  deflector_shield: "SHLD-05",
};

const SYSTEMS = Object.keys(SYSTEM_CODES);

let currentSystem: string = SYSTEMS[Math.floor(Math.random() * SYSTEMS.length)];

app.get("/status", (_req: Request, res: Response) => {
  res.json({ damaged_system: currentSystem });
});

app.get("/repair-bay", (_req: Request, res: Response) => {
  const code = SYSTEM_CODES[currentSystem];
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Repair</title></head>
    <body>
      <div class="anchor-point">${code}</div>
    </body>
    </html>
  `;
  res.set("Content-Type", "text/html");
  res.send(html);
});

app.get("/phase-change-diagram", (req: Request, res: Response) => {
  const p = parseFloat(req.query.pressure as string);
  if (isNaN(p)) {
    res.status(400).json({ error: "Invalid pressure value" });
    return;
  }

  const min = saturationData[0].pressure;
  const max = saturationData[saturationData.length - 1].pressure;

  if (p < min || p > max) {
    res.status(404).json({ error: "Pressure out of saturation range" });
    return;
  }

  const exact = saturationData.find((point) => point.pressure === p);
  if (exact) {
    res.json({
      specific_volume_liquid: Number(exact.v_liq.toFixed(4)),
      specific_volume_vapor: Number(exact.v_vap.toFixed(4)),
    });
    return;
  }

  const [p1, p2] = saturationData;

  const interpolate = (
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    x: number
  ): number => {
    return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
  };

  const v_liq = interpolate(p1.pressure, p2.pressure, p1.v_liq, p2.v_liq, p);
  const v_vap = interpolate(p1.pressure, p2.pressure, p1.v_vap, p2.v_vap, p);

  res.json({
    specific_volume_liquid: Number(v_liq.toFixed(4)),
    specific_volume_vapor: Number(v_vap.toFixed(4)),
  });
  return;
});

app.post("/teapot", (_req: Request, res: Response) => {
  res.status(418).send("I'm a teapot");
});

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
