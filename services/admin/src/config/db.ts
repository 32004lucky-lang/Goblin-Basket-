import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export const connectDb = async (): Promise<Db> => {
  if (db) return db;

  const rawUri = process.env.MONGO_URI || "mongodb://localhost:27017/Zomato_Clone";
  let formattedUri = rawUri;
  try {
    if (rawUri.startsWith("mongodb+srv://") || rawUri.startsWith("mongodb://")) {
      const [left, right] = rawUri.split("@");
      if (left && right && rawUri.split("@").length === 2) {
        const authPart = left.replace(/^mongodb(\+srv)?:\/\//, "");
        const [user, ...pwdParts] = authPart.split(":");
        const pwd = pwdParts.join(":");
        if (user && pwd && !pwd.includes("%")) {
          const prefix = rawUri.startsWith("mongodb+srv://") ? "mongodb+srv://" : "mongodb://";
          formattedUri = `${prefix}${encodeURIComponent(decodeURIComponent(user))}:${encodeURIComponent(decodeURIComponent(pwd))}@${right}`;
        }
      }
    }
  } catch {
    formattedUri = rawUri;
  }

  client = new MongoClient(formattedUri);
  await client.connect();

  const dbName = process.env.DB_NAME || "Zomato_Clone";
  db = client.db(dbName);

  console.log(`Admin service connected to mongodb (${dbName})`);

  return db;
};
