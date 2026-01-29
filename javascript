const { default_api } = require("shared_module");
const clients = require("shared_module").clients;

default_api.readFilesToContextTool({
    file_paths: ["src/convex/vectal.ts"]
});
