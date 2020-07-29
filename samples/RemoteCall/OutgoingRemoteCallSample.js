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
  console.error("OutgoingRemoteCallSample: SDK is not active!");
}

// install logging callbacks
Api.setLoggingCallbacks({
  warning: (msg) => console.error("OutgoingRemoteCallSample SDK warning: " + msg),
  error: (msg) => console.error("OutgoingRemoteCallSample SDK error: " + msg)
});

// ----------------------------------------------------------------------------
const cp = require("child_process");

let id = 0;
const map = new Map();

// start the remote call server
const remoteCallServer = cp.fork(__dirname + "/IncomingRemoteCallSample", { execArgv: [] });

// listen on incoming messages and process
remoteCallServer.on("message", (message) => {
  const doneCb = map[message.id];
  if (doneCb) {
    doneCb(message.error, message.result);
    map.delete(message.id);
  }
});

// send a message to remote server, returns a Promise
function doOutgoingRemoteCall(method, data, dtTag) {
  return new Promise((resolve, reject) => {
    const msg = {
      method: method,
      text: data,
      id: id++,
      traceTag: dtTag
    };
    remoteCallServer.send(msg);

    // register callback in message id map, once alled promise is resolved/rejected
    map[msg.id] = (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    };
  });
}

// Issue a traced outgoing remote call
async function tracedOutgoingRemoteCall(method, data) {
  const tracer = Api.traceOutgoingRemoteCall({
    serviceEndpoint: "ChildProcess",
    serviceMethod: method,  // the name of the remote method called
    serviceName: "StringManipulator",
    channelType: Sdk.ChannelType.NAMED_PIPE
  });

  try {
    // start tracer, get dynatrace tag and trigger sending via doOutgoingRemoteCall()
    return await tracer.start(function triggerTaggedRemoteCall() {
      // getting a tag from tracer needs to be done after start()
      const dtTag = tracer.getDynatraceStringTag();
      // now trigger the actual remote call
      return doOutgoingRemoteCall(method, data, dtTag);
    });
  } catch (e) {
    tracer.error(e);
    throw e;
  } finally {
    tracer.end();
  }
}

// ----------------------------------------------------------------------------

// send messages to server and wait for results
tracedOutgoingRemoteCall("toUpper", "StRiNg").then((res) => console.log("toUpper(StRiNg): " + res), (err) => console.log("toUpper(StRiNg) failed: " + err));
tracedOutgoingRemoteCall("toLower", "StRiNg").then((res) => console.log("toLower(StRiNg): " + res), (err) => console.log("toLower(StRiNg) failed: " + err));
tracedOutgoingRemoteCall("ShallFail", "StRiNg").then((res) => console.log("ShallFail(StRiNg): " + res), (err) => console.log("ShallFail(StRiNg) failed with message: " + err));

// keep application running a while to allow OneAgent to report all data
setTimeout(() => process.exit(0), 120000);
