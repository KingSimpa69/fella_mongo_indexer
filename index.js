const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');

const mongoUrl = 'mongodb://127.0.0.1:27017';
const databaseName = 'based_fellas';
const collectionName = 'metadata';
const jsonDirectory = './meta';

mongoose.connect(`${mongoUrl}/${databaseName}`, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

const schema = new mongoose.Schema({
  description: String,
  name: String,
  image: String,
  attributes: [{
    trait_type: String,
    value: String,
  }],
});

const YourModel = mongoose.model('FellaSchema', schema, collectionName);

function insertJsonFile(jsonFilePath, callback) {
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading ${jsonFilePath}: ${err}`);
      return callback(err);
    }

    try {
      const jsonData = JSON.parse(data);
      const newDocument = new YourModel(jsonData);

      newDocument.save((saveErr) => {
        if (saveErr) {
          console.error(`Error inserting data from ${jsonFilePath}: ${saveErr}`);
          callback(saveErr);
        } else {
          console.log(`Inserted data from ${jsonFilePath}`);
          callback();
        }
      });
    } catch (parseErr) {
      console.error(`Error parsing JSON from ${jsonFilePath}: ${parseErr}`);
      callback(parseErr);
    }
  });
}

function indexAllJsonFiles() {
  const jsonFiles = fs.readdirSync(jsonDirectory).filter((filename) => filename.endsWith('.json'));
  async.eachLimit(
    jsonFiles,
    10,
    (filename, callback) => {
      const jsonFilePath = `${jsonDirectory}/${filename}`;
      insertJsonFile(jsonFilePath, callback);
    },
    (err) => {
      if (err) {
        console.error('Error indexing JSON files:', err);
      } else {
        console.log('All JSON files indexed successfully.');
      }
      mongoose.disconnect();
    }
  );
}

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB successfully.');

  db.db.createCollection(collectionName, (createErr) => {
    if (createErr) {
      console.error(`Error creating collection ${collectionName}: ${createErr}`);
      mongoose.disconnect();
    } else {
      console.log(`Database and collection ${collectionName} created successfully.`);
      indexAllJsonFiles();
    }
  });
});