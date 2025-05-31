"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
// Tüm route'lar app.ts'de tanımlanıyor
app_1.default.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
    console.log('API endpoint:', `http://localhost:${PORT}/api/v1`);
});
