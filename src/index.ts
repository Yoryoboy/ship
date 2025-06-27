import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

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

app.post("/teapot", (_req, res) => {
  res.status(418).send("I'm a teapot");
});

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
