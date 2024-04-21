import * as dotenv from "dotenv";
dotenv.config();

import Elysia from "elysia";
import { urlController } from "./src/shortener.controller";

const app = new Elysia();
const PORT = Bun.env.PORT;

app.use(urlController as any);

app.listen(PORT, () => {
    console.log(`Url Shortner is running on port ${PORT}`);
});
