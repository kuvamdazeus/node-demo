import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import axios from "axios";
import z from "zod";

const requestBodySchema = z.object({
  cities: z.array(z.string()).nonempty(),
});

const app = express();

app.use(cors());
app.use(express.json());

const getCityApiUrl = (city: string) =>
  `http://api.weatherapi.com/v1/current.json?q=${city}&key=${process.env.WEATHER_API_KEY}`;

app.post("/getWeather", async (req, res) => {
  const result = requestBodySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ message: "Invalid request" });

  const temps = await Promise.all(
    result.data.cities.map(async (city) => {
      const tempC = await axios
        .get(getCityApiUrl(city))
        .then((res) => res?.data?.current?.temp_c)
        .catch(() => undefined);

      const object = {} as any;
      if (tempC) object[city] = `${tempC}C`;
      else object[city] = null;

      return object;
    })
  );

  return res.status(200).json(temps);
});

app.listen(process.env.PORT || 3001, () => console.log("Listing at 3001..."));
