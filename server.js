import app from "./src/app/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";


await connectDB()

app.listen(config.PORT, () => {
  console.log(`server is running on port ${config.PORT}`);
});
