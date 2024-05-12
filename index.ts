// index.ts
import Elysia from "elysia";
import { urlController } from "./src/controller.ts";
import config from './config';

const app = new Elysia();

if (typeof app === 'undefined') {
    throw new Error('Could not initialize Elysia');
}

// Apply the controller to your app
urlController(app);

// Start listening on the configured port
const port = parseInt(config.elysiaJs.PORT, 10);
if (isNaN(port)) {
    throw new Error('Invalid port number');
}

app.listen(port, () => {
    console.log(`URL Shortener is running on port ${port}`);
});