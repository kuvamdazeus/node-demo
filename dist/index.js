"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const zod_1 = __importDefault(require("zod"));
const requestBodySchema = zod_1.default.object({
    cities: zod_1.default.array(zod_1.default.string()).nonempty(),
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const getCityApiUrl = (city) => `http://api.weatherapi.com/v1/current.json?q=${city}&key=${process.env.WEATHER_API_KEY}`;
app.post("/getWeather", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = requestBodySchema.safeParse(req.body);
    if (!result.success)
        return res.status(400).json({ message: "Invalid request" });
    const temps = yield Promise.all(result.data.cities.map((city) => __awaiter(void 0, void 0, void 0, function* () {
        const tempC = yield axios_1.default
            .get(getCityApiUrl(city))
            .then((res) => { var _a, _b; return (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.temp_c; })
            .catch(() => undefined);
        const object = {};
        if (tempC)
            object[city] = `${tempC}C`;
        else
            object[city] = null;
        return object;
    })));
    return res.status(200).json(temps);
}));
app.listen(process.env.PORT || 3001, () => console.log("Listing at 3001..."));
