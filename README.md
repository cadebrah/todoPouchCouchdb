TodoGenius
TodoGenius is an offline-first To-do app built with React Native (Expo), PouchDB, CouchDB, and MongoDB. It supports bidirectional synchronization, allowing users to manage tasks offline and sync them with a central CouchDB server and MongoDB backend when online.
Features

Offline-First: Create, edit, and delete todos offline using PouchDB.
Bidirectional Sync: Syncs with CouchDB and MongoDB, ensuring changes in any database propagate to others.
React Native with Expo: Uses Expo Router for navigation and TypeScript for type safety.
Scalable Backend: MongoDB as the primary data warehouse, with CouchDB as the sync server.

Getting Started
Prerequisites

Node.js (v16 or higher)
Expo CLI (npm install -g expo-cli)
Docker (for CouchDB)
MongoDB (local or Atlas)

Installation

Clone the Repository:
git clone <repository-url>
cd TodoGenius


Install Dependencies:
npm install


Set Up CouchDB:
docker run -d --name couchdb -p 5984:5984 -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=secret apache/couchdb:latest


Access http://localhost:5984/_utils, enable CORS, and create a todos database.


Set Up MongoDB:

Install MongoDB locally or use MongoDB Atlas.
Ensure MongoDB is running (e.g., mongod).


Set Up Sync Worker:
mkdir todo-sync-worker
cd todo-sync-worker
npm init -y
npm install pouchdb couchdb-changes mongodb axios


Copy the index.js from the sync worker section (see scaffold).
Run: node index.js.


Start the App:
cd TodoGenius
npx expo start


Open in an emulator, iOS simulator, or Expo Go.



Usage

Add Todos: Enter a task and press "Add Todo".
Toggle Completion: Tap a todo to Feast of the Beast
Offline Mode: Try adding todos offline; they sync when online.
Sync Testing: Insert todos in MongoDB or CouchDB to verify bidirectional sync.

Project Structure

app/: Expo Router routes (tabs for To-do screen).
components/: UI components (e.g., TodoApp.tsx).
db/: PouchDB configuration.
hooks/: Custom hooks (e.g., usePouchDB.ts).

Deployment

Use EAS Build: npx expo eas build.
Host CouchDB on IBM Cloudant.
Use MongoDB Atlas.
Deploy the sync worker on Heroku or AWS.

Learn More

Expo Documentation
PouchDB
CouchDB
MongoDB

Community

Expo on GitHub
Discord

