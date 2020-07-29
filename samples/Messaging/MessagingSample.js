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
  console.error("MessagingSample: SDK is not active!");
}

// install logging callbacks
Api.setLoggingCallbacks({
  warning: (msg) => console.error("MessagingSample SDK warning: " + msg),
  error: (msg) => console.error("MessagingSample SDK error: " + msg)
});

// ----------------------------------------------------------------------------
const systemInfo = {
  destinationName: "aDestination",
  destinationType: Sdk.MessageDestinationType.TOPIC,
  vendorName: "MessageSystemVendorName",
  host: "message.system.host",
  port: 56012
};

let msgId = 0;

function sendMessage(name, data, corrId, dtTag) {
  // create the message object to send
  const msg = {
    meta: {
      name,
      msgId: msgId++,
      corrId,
      dtTag
    },
    data
  };

  // sending is simulated via setTimout here
  setTimeout(traceIncomingMessage, 50, msg);

  return msg.meta.msgId;
}

function traceIncomingMessage(msg) {
  // create a tracer instance and start the trace, ensure dynatraceTag is set
  const startData = Object.assign({ dynatraceTag: msg.meta.dtTag }, systemInfo);
  const tracer = Api.traceIncomingMessage(startData);
  tracer.start(function processMessage(done) {
    // optional: set correlationId/vendorMessageId if present/relevant
    tracer.setCorrelationId(msg.meta.corrId).setVendorMessageId(`${msg.meta.msgId}`);

    // do whatever needed with the message, simulated via nextTick() here
    process.nextTick(done);
  }, function onDone(err) {
    if (err) {
      tracer.error();
    }
    tracer.end();
  });
}

function traceOutgoingMessage(name, data, corrId) {
  // create a tracer instance and start the trace
  const tracer = Api.traceOutgoingMessage(systemInfo);
  tracer.start(function sendTaggedMessage() {
    // getting a tag from tracer needs to be done after start()
    const dtTag = tracer.getDynatraceStringTag();
    try {
      // now trigger the actual sending of the message
      const messageId = sendMessage(name, data, corrId, dtTag);

      // optional: set correlationId/vendorMessageId if present/relevant
      tracer.setCorrelationId(corrId).setVendorMessageId(`${messageId}`);
    } catch (e) {
      tracer.error(e);
      throw e;
    } finally {
      tracer.end();
    }
  });
}

// ----------------------------------------------------------------------------
// create some traffic
setInterval(() => traceOutgoingMessage("aMessage", "SomeData", "aCorrelationId"), 500);

// keep application running a while to allow OneAgent to report all data
setTimeout(() => process.exit(0), 120000);
