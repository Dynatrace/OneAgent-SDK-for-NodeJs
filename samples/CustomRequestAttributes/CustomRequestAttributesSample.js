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
  console.error("CustomRequestAttributesSample: SDK is not active!");
}

// install logging callbacks
Api.setLoggingCallbacks({
  warning: (msg) => console.error("CustomRequestAttributesSample SDK warning: " + msg),
  error: (msg) => console.error("CustomRequestAttributesSample SDK error: " + msg)
});

// ----------------------------------------------------------------------------
const http = require("http");

// ----------------------------------------------------------------------------
const server = http.createServer(function onRequest(req, res) {
  // set attribute named "fooAttribute" with value "bar"
  Api.addCustomRequestAttribute("fooAttribute", "bar");

  process.nextTick(() => {
    // setting attributes after async functions is possible as long as transactional context is found by OneAgent
    // set attribute named "barAttribute" with value 15.34
    Api.addCustomRequestAttribute("barAttribute", 15.34);

    res.end();
  });
}).listen(8002).on("listening", () => setInterval(() => http.get("http://localhost:" + server.address().port), 500));
