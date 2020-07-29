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
  console.error("IncomingRemoteCallSample: SDK is not active!");
}

// install logging callbacks
Api.setLoggingCallbacks({
  warning: (msg) => console.error("IncomingRemoteCallSample SDK warning: " + msg),
  error: (msg) => console.error("IncomingRemoteCallSample SDK error: " + msg)
});

// ----------------------------------------------------------------------------

// Function actually processing the message
async function processMessage(message) {
  switch (message.method) {
    case "toUpper": return message.text.toUpperCase();
    case "toLower": return message.text.toLowerCase();
    default: throw new Error("Unsupported method: " + message.method);
  }
}

// trace and handle incoming messages
async function tracedMessageHandler(message) {
  const tracer = Api.traceIncomingRemoteCall({
    serviceEndpoint: "ChildProcess",
    serviceMethod: message.method,
    serviceName: "StringManipulator",
    dynatraceTag: message.traceTag,   // extract and set the dynatrace tag
    protocolName: "Json"              // optional
  });

  try {
    // start tracer and trigger actual message processing via processMessage(message)
    const result = await tracer.start(processMessage, message);

    // send result calculated by processMessage() back to caller
    process.send({ result: result, id: message.id });

    // end tracer
    tracer.end();
  } catch (e) {
    // send error back
    process.send({ error: e.message, id: message.id });

    // set error and end tracer
    tracer.error(e).end();
  }
}

process.on("message", tracedMessageHandler);
