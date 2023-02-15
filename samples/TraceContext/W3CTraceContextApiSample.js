/*
    Copyright 2023 Dynatrace LLC

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
  console.error("W3CTraceContextApiSample: SDK is not active!");
}

// install logging callbacks
Api.setLoggingCallbacks({
  warning: (msg) => console.error("W3CTraceContextApiSample SDK warning: " + msg),
  error: (msg) => console.error("W3CTraceContextApiSample SDK error: " + msg)
});

// ----------------------------------------------------------------------------
const http = require("http");

// ----------------------------------------------------------------------------
const server = http.createServer(function onRequest(req, res) {
	// if a OneAgent is available this will return a TraceContextInfo where `isValid` is `true`.
	// traceId and spanId will have non-default valid values
	const localTC = Api.getTraceContextInfo();
	console.log(`valid: ${localTC.isValid}, traceid: ${localTC.traceid}, spanid: ${localTC.spanid}`);
}).listen(8001).on("listening", () => setInterval(() => http.get("http://localhost:" + server.address().port), 500));

// this will return a TraceContextInfo where `isValid` is false and the traceId and spanId have their respective default values
const currentTC = Api.getTraceContextInfo();
console.log(`valid: ${currentTC.isValid}, traceid: ${currentTC.traceid}, spanid: ${currentTC.spanid}`);

setTimeout(() => process.exit(0), 120000);
