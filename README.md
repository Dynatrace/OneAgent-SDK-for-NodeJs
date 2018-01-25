**Disclaimer: This SDK is currently in early access and still work in progress.**

# Node.js SDK for Dynatrace OneAgent

This module provides JavaScript bindings for Node.js applications monitored with [Dynatrace](https://www.dynatrace.com/technologies/nodejs-monitoring/).

## Overview

The current version provides APIs to trace remote calls and SQL database requests. The main purpose is to allow the user to add service level insight for modules currently not supported out-of-the-box by OneAgent.

Additionally, it provides a method `passContext()` which may be used to pass transactional context through chains of callbacks for *modules that are not yet supported out-of-the-box* by OneAgent.

Dynatrace supports many technologies out-of-the-box and this module needs to be used only in rare corner cases - so only use this module if transactions seem to be incomplete.

A high level documentation/description of OneAgent SDK concepts is available at [OneAgent-SDK](https://github.com/Dynatrace/OneAgent-SDK/).

## Installation

`$ npm install --save @dynatrace/oneagent-sdk`

## Usage

### Get an Api object

The first step is to aquire an OneAgent SDK API object by calling `createInstance()`. The resulting object holds methods to create tracers, administrative methods (e.g. check SDK state, install logging callbcacks) and `passContext()`. Every call to `createInstance()` will return a new API object allowing the user to install seperate logging callbacks for seperate use cases.

```js
const Sdk = require('@dynatrace/oneagent-sdk');
const Api = Sdk.createInstance();

```

### Trace a SQL database request

A SQL database request is traced by calling `traceSQLDatabaseRequest()` which requires a database info object as first argument and an object with request specific data as second parameter.

The database info is an object which usually doesn't change during runtime. It holds following properties:

- `name` Mandatory - a string defining the name of the database
- `vendor` Mandatory - a string holding the database vendor name (e.g. Oracle, MySQL, ...), can be an user defined name or one of the constants in [DatabaseVendor](#constants-for-database-vendors)

Additionally, it holds following properties describing the connection to the database. Depending on the actual connection used the corresponding property/properties shall be set.
If the specific information like host/socketPath/... is not available the property channelType shall be set.

- `host` A string specifying the hostname in case of a TCP/IP connection is used (note that OneAgent may try to resolve the hostname)
- `port` The TCP/IP port (optional)
- `socketPath` A string specifying the UNIX domain socket path used
- `pipeName` A string specifying the name of the pipe used
- `channelType` Specifies the channel type (e.g. TCP/IP, IN_PROCESS,... ) used. Valid values are available via [ChannelType](#channel-type-constants)

The second argument holds data describing the concrete operation and holds following properties:

- `statement` Mandatory - a string holding the SQL statement to be sent to database.

The result of `traceSQLDatabaseRequest()` is a tracer object to be used for further operations related to this trace (see [Common characteristics of tracers](#common-characteristics-of-tracers) for details).

Please note that SQL database traces are only created if they occur within some other SDK trace (e.g. incoming remote call) or an OneAgent built-in trace (e.g. incoming web request).

**Example**

```js
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
    }
    // end the tracer and call client callback forwarding results
    tracer.end(clientCb, err, results, fields);
  });
}
```

### Trace an outgoing remote call

An outgoing remote call is traced by calling `traceOutgoingRemoteCall()` passing an object with following properties:

- `serviceMethod` Mandatory - a string holding the name of the called remote method
- `serviceName` Mandatory - a string holding the name of the remote service
- `serviceEndpoint` Mandatory - a string describing the logical endpoint of the remote service
- `protocolName` Optional - a string describing the protocol used (e.g. Protobuf, GIOP,...)

Additionally it holds following properties describing the connection to the remote service. Depending on the connection type the corresponding property/properties shall be set.
If the specific information like host/socketPath/... is not available the property channelType shall be set.

- `host` A string specifying the hostname in case of a TCP/IP connection is used (note that OneAgent may try to resolved the hostname)
- `port` The TCP/IP port (optional)
- `socketPath` A string specifying the UNIX domain socket path used
- `pipeName` A string specifying the name of the Pipe used
- `channelType` Specifies the channel type (e.g. TCP/IP, IN_PROCESS,... ) used. Valid values are available via [ChannelType](#channel-type-constants))

The result of `traceOutgoingRemoteCall()` is a tracer object to be used for further operations related to this trace (see [Common characteristics of tracers](#common-characteristics-of-tracers) for details).
As an outgoing remote call is _taggable_ a dynatrace tag shall be created from tracer after it has been started and embedded to the remote call message content.

**Example**

```js
// Issue a traced outgoing remote call
async function tracedOutgoingRemoteCall(method, data) {
  const tracer = Api.traceOutgoingRemoteCall({
    serviceEndpoint: "ChildProcess",
    serviceMethod: method,
    serviceName: "StringManipulator",
    channelType: Sdk.ChannelType.NAMED_PIPE
  });

  try {
    // start tracer, get dynatrace tag and trigger sending via sendMessage()
    return await tracer.start(function sendTaggedMessage() {
      // getting a tag from tracer needs to be done after start()
      const dtTag = tracer.getDynatraceStringTag();
      return sendMessage(method, data, dtTag);
    });
  } catch (e) {
    tracer.error(e);
    throw e;
  } finally {
    tracer.end();
  }
}

```

### Trace an incoming remote call

An incoming remote call is traced by calling `traceIncomingRemoteCall()` passing an object with following properties:

- `serviceMethod` Mandatory - a string holding the name of the called remote method
- `serviceName` Mandatory - a string holding the name of the remote service
- `serviceEndpoint` Mandatory - a string describing the logical endpoint of the remote service
- `protocolName` Optional - a string describing the protocol used (e.g. Protobuf, GIOP,...)
- `dynatraceTag` - a `string` or `Buffer` holding the received dynatrace tag recevied

The result of this call is a tracer object to be used for further operations related to this trace (see [Common characteristics of tracers](#common-characteristics-of-tracers)).

**Example**

```js
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
```

### Common characteristics of tracers

The life-cycle of a tracer is as follows:

1. Create a trace using the `traceXXX` method matching to your use case. For incoming taggable traces pass the received dynatrace tag (if present) to the `traceXXX` method.
1. Start the trace which in turn invokes and times the given handler function.
1. For outgoing taggable traces fetch a dynatrace tag and include it to the message sent out.
1. Optional mark the traced operation as failed via a call to `error()`
1. End the trace once the operation is done. For outgoing traces you may pass an callback to be included in this trace.

Each tracer offers following methods:

- `start(handler, ...args)` Start a trace and calls the given handler function with the provides arguments. Returns the return value of handler.
- `startWithContext(handler, thisObj, ...args)` Like `start()` but allows to specify the `this` context for the call to handler.
- `error(err)` Mark trace as failed and attach an error object. Shall be call at max once per trace. Does not end the trace! Returns the tracer itself.
- `end()` End the trace.

Tracers for outgoing requests additionally offer enhanced methods to end a trace which allow to include the followup callback to the PurePath of this trace.

- `end(callback, ...args)` End the trace like `end()` but additionally calls the passed callback with given arguments. The return value from callback is forwarded to caller of `end`.
- `endWithContext(callback, thisObj, ...args)` like `end()` above but with the possiblity to specify the `this` context for the callback.

Tracers for outgoing taggable requests additionally offer following methods to get a _dynatrace tag_ to be sent to remote service after the trace was started:

- `getDynatraceStringTag()` returns a dynatrace tag endcoded as `string`
- `getDynatraceByteTag()` returns a dynatrace tag binary encoded as `Buffer`

This dynatrace tag needs to be embedded into the message sent to remote service. Depending on the concrete protcol used the `string` or binary representation may fit better and it's up to the user to decide which variant to use.
On incoming service this tag needs to be extracted by the user and passed to the corresponding `traceXXX` method using the `dynatraceTag` property of the arguments to allow linking of outgoing and the corresponding incoming trace.

The tracer objects returned by above methods are always valid even if there is no OneAgent present or no trace is created for whatever reason. In this case the methods are still present to avoid the need of extra checking in client code.

Please note that OneAgent uses the name of the given functions in `start()` and `end()` to name PurePath nodes. Therefore we recommend to prefer named functions to anonymous functions to give you higher quality traces.

### Channel Type Constants

The values of constant `ChannelType` specify the type of the transport channel used. Following values are provided:

- `TCP_IP` Communication via TCP/IP
- `UNIX_DOMAIN_SOCKET` Communication via UNIX domain socket
- `NAMED_PIPE` Communication via named pipe
- `IN_PROCESS` Communication is some mechanism withing current process (e.g. via files,...)
- `OTHER` To be used for any other channel type

### Constants for database vendors

The values of constant `DatabaseVendor` may be used as input for `traceSQLDatabaseRequest()`. Following values are provided:

- `APACHE_HIVE`
- `CLOUDSCAPE`
- `HSQLDB`
- `PROGRESS`
- `MAXDB`
- `HANADB`
- `INGRES`
- `FIRST_SQL`
- `ENTERPRISE_DB`
- `CACHE`
- `ADABAS`
- `FIREBIRD`
- `DB2`
- `DERBY_CLIENT`
- `DERBY_EMBEDDED`
- `FILEMAKER`
- `INFORMIX`
- `INSTANT_DB`
- `INTERBASE`
- `MYSQL`
- `MARIADB`
- `NETEZZA`
- `ORACLE`
- `PERVASIVE`
- `POINTBASE`
- `POSTGRESQL`
- `SQLSERVER`
- `SQLITE`
- `SYBASE`
- `TERADATA`
- `VERTICA`
- `CASSANDRA`
- `H2`
- `COLDFUSION_IMQ`
- `REDSHIFT`

### Administrative Apis

#### Current SDK state

The method `getCurrentState()` returns the current status of SDK. Valid values are available via constant object `SDK.SDKState`:

- `ACTIVE` SDK is connected to agent and capturing data.
- `TEMPORARILY_INACTIVE` SDK is connected to agent, but capturing is disabled. In this state, SDK user can skip creating SDK transactions and save CPU time. SDK state should be checked regularly as it may change at every point of time.
- `PERMANENTLY_INACTIVE` SDK isn't connected to agent. So it will never capture data. This SDK state will never change in current JVM life time. It is good practice to never call any SDK api and safe CPU time therefore.

#### Set callbacks for logging

The method `setLoggingCallback(callbacks)` can be used to set callbacks for warning and error logs. A logging callback receives a string as argument. As parameter pass an object with following properties:

- `warning` Optional - a function accepting a string as parameter called to pass warning messages
- `error` Optional - a function accepting a string as parameter called to pass error messages

Omitting a callback property will uninstall a previous installed callback.

```js
Api.setLoggingCallbacks({
  warning: (msg) => console.error("DatabaseRequestSample SDK warning: " + msg),
  error: (msg) => console.error("DatabaseRequestSample SDK error: " + msg),
});
```

### PassContext

**Example: Regular callbacks**
Assume `some.asyncFunction()` in below sample causes loss of transactional context in OneAgent. To ensure that OneAgent correctly shows activities triggered inside the callback of this function `passContext()` can be used to create a closure preserving the transactional context active at call time of `some.asyncFunction()`.

```js
const Api = require('@dynatrace/oneagent-sdk').createInstance();

some.asyncFunction(someParam, Api.passContext(function(err, result) {
  // Context is preserved
  http.get('https://some-api.xyz/service', Api.passContext((res) => {
    // other activity, e.g. outgoing web requests,...
  }));
}));
```

### Please Note

- Make sure that this module is required after Dynatrace OneAgent
- Using this module will not cause any errors if no agent is present (e.g. in testing)
- The wrapping via `passContext()` needs to happen call time of the corresponding sync call

```js
// This will *NOT* work as transactional context at calltime of some.asyncFunction() is not preserved
// instead the transactional context at definition of doSomething() is perserved which is not
// related to the relevant transaction triggered by calling some.asyncFunction().
const wrappedFunction = dta.passContext(someFunction);
function doSomething() {
  some.asyncFunction('someParam', wrappedFunction);
}

// This works, passContext() is called at invocation time of some.asyncFunction()
function doSomething() {
  some.asyncFunction('someParam', dta.passContext(someFunction));
}
```

## Further Information

### What is transactional context

[Dynatrace's patented PurePath Technology®](https://www.dynatrace.com/en_us/application-performance-management/products/purepath-technology.html) captures timing and code level context for *all* transactions,
end-to-end, from user click, across all tiers, to the database of record and back.
Technically this means that Dynatrace adds transactional context to any inbound-, outbound- and function call of an application.

### What does this mean for Node.js applications

Node.js is single threaded - its control flow is based on events and asynchronous callbacks.

Let's look at an example for finding a document with mongoDB:

```js
function callback(err, document) {
  console.log(document.name);

  http.get('https://some-api.xyz/service', (res) => {});
    // ^^^                                 °°°°°°°°°°°
    // Asynchronous call                   Asynchronous callback
}

collection.findOne({_id: doc_id}, callback);
        // ^^^^^^^                °°°°°°°°
        // Asynchronous call      Asynchronous callback

```

After `collection.findOne()` is executed asynchronously `callback()` will be called.
`callback()` again contains an asynchronous call `http.get()` which performs an outbound HTTP request.
If there is a current transactional context with an ongoing trace, Dynatrace OneAgent will transparently add a HTTP header containing a dynatrace tag to this outbound request.
The next tier - if instrumented with OneAgent - will continue this trace then.

Without further intervention any transactional context would get lost between asynchronous invocation and a callback.

Currently the only reliable way to pass over context information to a callback is called 'wrapping'.

This means: Dynatrace will transparently wrap *supported* libraries to add context information.
For every yet *unsupported* module `passContext()` can be used to provide transactional context to callbacks.

## OneAgent SDK for Node.Js Requirements

- Dynatrace OneAgent for Node.JS needs to be installed on the system that is to be monitored (supported versions see below).
- In case OneAgent is loaded via [OneAgent NPM module](https://www.npmjs.com/package/@dynatrace/oneagent) or some similar tool it's important to require the SDK afterwards.

## Compatibility OneAgent SDK for Node.Js releases with OneAgent releases

|OneAgent SDK for Node.Js|Dynatrace OneAgent|
|:-----------------------|:-----------------|
|1.0.1                   |>=1.137           |

## Support

The Dynatrace OneAgent SDK for Node.Js is currently in early access. Please report issues via the [GitHub issue tracker](https://github.com/Dynatrace/OneAgent-SDK-for-NodeJs/issues/).

## Release Notes

|Version|Date       |Description    |
|:------|:----------|:--------------|
|1.0.1  |01.2018    |Initial release|
