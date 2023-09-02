import { createAdapter } from "@socket.io/mongo-adapter";
import { MongoClient } from "mongodb";
import { getMongoBaseURI } from "../config";
const COLLECTION = "socket.io-adapter-events";
const DB = "sockets";

const client = new MongoClient(getMongoBaseURI(), {
  useUnifiedTopology: true,
} as any);

export async function createSocketAdapter() {
  await client.connect();

  try {
    await client.db(DB).createCollection(COLLECTION, {
      capped: true,
      size: 1e6,
    });
  } catch (e) {
    // collection already exists
  }
  const mongoCollection: any = client.db(DB).collection(COLLECTION);

  return createAdapter(mongoCollection, {});
}
