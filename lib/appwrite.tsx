// lib/appwrite.ts
import { Client, Account, ID, Databases, Query } from "appwrite";

const client = new Client();

client
    .setEndpoint("https://fra.cloud.appwrite.io/v1") // e.g., https://cloud.appwrite.io/v1
    .setProject("684e6fa9002b76316088");

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query };