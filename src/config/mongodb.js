const { GridFSBucket, MongoClient, ObjectId } = require('mongodb');

const mongoUrl = process.env.DATABASE_URL;
const mongoDbName = process.env.MONGODB_DB_NAME;
const uploadBucketName = process.env.MONGODB_UPLOAD_BUCKET || 'codequest_assets';

let client;
let db;
let bucket;

function resolveDbName() {
  if (mongoDbName) return mongoDbName;
  if (!mongoUrl) return 'codequest';

  const pathname = new URL(mongoUrl).pathname.replace(/^\//, '');
  return pathname || 'codequest';
}

async function getMongoDb() {
  if (!mongoUrl) {
    throw new Error('DATABASE_URL is required for MongoDB uploads');
  }

  if (!client) {
    client = new MongoClient(mongoUrl);
    await client.connect();
  }

  if (!db) {
    db = client.db(resolveDbName());
  }

  return db;
}

async function getUploadBucket() {
  if (!bucket) {
    const database = await getMongoDb();
    bucket = new GridFSBucket(database, { bucketName: uploadBucketName });
  }
  return bucket;
}

function toObjectId(value) {
  if (!value) return null;
  if (!ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

module.exports = {
  getMongoDb,
  getUploadBucket,
  toObjectId,
  uploadBucketName,
};
