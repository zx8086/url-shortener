// index.ts

import Elysia from "elysia";
import { urlController } from "./src/shorten.controller.ts";

const app = new Elysia();

// Ensure the PORT environment variable is available
const PORT = Bun.env.PORT || '3005'; // Provide a default value if not set

// Properly apply the controller to your app
urlController(app); // Assuming urlController is a function that takes an app instance

// Start listening on the configured port
app.listen(parseInt(PORT, 10), () => { // Ensure port is treated as a number
    console.log(`URL Shortener is running on port ${PORT}`);
});
