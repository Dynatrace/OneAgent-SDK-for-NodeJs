/*
    Copyright 2019 Dynatrace LLC

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

"use strict";

// tslint:disable:no-console

// ----------------------------------------------------------------------------
const Sdk = require("@dynatrace/oneagent-sdk");
const Api = Sdk.createInstance();

// ----------------------------------------------------------------------------
if (Api.getCurrentState() !== Sdk.SDKState.ACTIVE) {
  console.error("DatabaseRequestSample: SDK is not active!");
}

// install logging callbacks
Api.setLoggingCallbacks({
  warning: (msg) => console.error("DatabaseRequestSample SDK warning: " + msg),
  error: (msg) => console.error("DatabaseRequestSample SDK error: " + msg)
});

// ----------------------------------------------------------------------------
const http = require("http");

// ----------------------------------------------------------------------------
// Simple simulation of a database...
class SomeDbConnection {
  query(sql, cb) {
    if (sql === "SELECT * FROM Persons WHER Name='Max' AND Age>45") {
      setTimeout(cb, 100, new Error("illegal SQL statement"));
    } else {
      setTimeout(cb, 100, null, "TheDbResult", "fields");
    }
  }
}

const somesqldb = {
  createConnection(config) {
    return new SomeDbConnection(config);
  }
};

// ----------------------------------------------------------------------------
// Create the connection to database
const dbConfig = {
  host: "localhost",
  port: 57615,
  user: "root",
  password: "12345",
  database: "TestDb"
};
const connection = somesqldb.createConnection(dbConfig);

// Static info describing the database
const dbInfo = {
  name: dbConfig.database,
  vendor: Sdk.DatabaseVendor.MARIADB,
  host: dbConfig.host,
  port: dbConfig.port
};

// Issue a traced SQL database request
function tracedSqlDatabaseRequest(sql, clientCb) {
  // create a SQL database tracer
  const tracer = Api.traceSQLDatabaseRequest(dbInfo, {
    statement: sql
  });

  // start tracer, calls connection.query(sql, cb) with connection set as this in query()
  tracer.startWithContext(connection.query, connection, sql, (err, results, fields) => {
    if (err) {
      // set the error on the tracer
      tracer.error(err);
    } else {
      // optionally set result data
      tracer.setResultData({
        rowsReturned: 15,
        roundTripCount: 32
      });
    }
    // end the tracer and call client callback forwarding results
    tracer.end(clientCb, err, results, fields);
  });
}

// ----------------------------------------------------------------------------
const server = http.createServer(function onRequest(req, res) {
  function onDbDone(err, result) {
    if (err) {
      console.log("Request failed: " + err);
    } else {
      console.log("Result from DB: " + result);
    }
    // end request
    if (--cnt === 0) {
      res.end();
    }
  }

  let cnt = 2;
  tracedSqlDatabaseRequest("SELECT * FROM Persons WHERE Name='Max' AND Age>45", onDbDone);
  tracedSqlDatabaseRequest("SELECT * FROM Persons WHER Name='Max' AND Age>45", onDbDone);
}).listen(8001).on("listening", () => setInterval(() => http.get("http://localhost:" + server.address().port), 500));

// keep application running a while to allow OneAgent to report all data
setTimeout(() => process.exit(0), 120000);
