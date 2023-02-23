# Dynatrace OneAgent SDK for Node.js

This SDK allows Dynatrace customers to instrument Node.js applications. This is useful to add service level insight for modules currently not directly supported by [Dynatrace OneAgent](https://www.dynatrace.com/technologies/nodejs-monitoring/) out-of-the-box.

This is the official Node.js implementation of the [Dynatrace OneAgent SDK](https://github.com/Dynatrace/OneAgent-SDK).

## Table of Contents

* [Package contents](#package-contents)
* [Requirements](#requirements)
* [Integration](#integration)
  * [Installation](#installation)
  * [Troubleshooting](#troubleshooting)
* [API Concepts](#api-concepts)
  * [OneAgentSDK object](#oneagentsdk-object)
  * [Tracers](#tracers)
* [Features](#features)
  * [Trace incoming and outgoing remote calls](#trace-incoming-and-outgoing-remote-calls)
  * [Trace messaging](#trace-messaging)
  * [Trace SQL database requests](#trace-sql-database-requests)
  * [Set custom request attributes](#set-custom-request-attributes)
  * [Metrics (deprecated)](#metrics)
  * [Trace context](#trace-context)
* [Administrative Apis](#administrative-apis)
  * [Current SDK state](#current-sdk-state)
  * [Set callbacks for logging](#set-callbacks-for-logging)
* [Constants](#constants)
  * [Channel type](#channel-type)
  * [Database vendors](#database-vendors)  
  * [Message destination type](#message-destination-type)
  * [Message system vendors](#message-system-vendors)
* [Pass Context](#pass-context)
* [Further reading](#further-readings)
* [Help & Support](#help--support)
* [Release notes](#release-notes)

## Package contents

* `samples`: sample applications, which demonstrates the usage of the SDK. See [readme](samples/README.md) inside the samples directory for more details
* `src`: source code of the SDK
* `test`: unit tests
* `LICENSE`: license under which the whole SDK and sample applications are published

## Requirements

* When loading the OneAgent via [OneAgent NPM module](https://www.npmjs.com/package/@dynatrace/oneagent) or a similar tool, make sure to require the SDK after the OneAgent
* Dynatrace OneAgent (required versions see below)
* The OneAgent SDK is not supported on serverless code modules, including those for AWS Lambda.
  In these scenarios consider using [OpenTelemetry](https://www.dynatrace.com/support/help/shortlink/opentel-lambda) instead.

|OneAgent SDK for Node.js|Required OneAgent version|Support status                           |
|:-----------------------|:------------------------|:----------------------------------------|
|1.5.x                   |>=1.259                  |Supported                                |
|1.4.x                   |>=1.179                  |Supported                                |
|1.3.x                   |>=1.165                  |Deprecated with support ending 2023-08-01|
|1.2.x                   |>=1.145                  |Deprecated with support ending 2023-08-01|
|1.1.x                   |>=1.143                  |Deprecated with support ending 2023-08-01|
|1.0.x                   |>=1.137                  |Deprecated with support ending 2023-08-01|

## Integration

Using this module should not cause any errors if no OneAgent is present (e.g. in testing).

Make sure that this module is loaded after Dynatrace OneAgent.

### Installation

`npm install --save @dynatrace/oneagent-sdk`

### Troubleshooting

If the SDK cannot connect to the OneAgent ([Current SDK state](#current-sdk-state) is not `ACTIVE`) verify that a matching version of OneAgent is used *and loaded before* the SDK module.

Verify that OneAgent is working as intended (see [Dynatrace OneAgent](https://www.dynatrace.com/technologies/nodejs-monitoring/)).

You should ensure that you have set [LoggingCallbacks](#set-callbacks-for-logging).

OneAgent transparently wraps *supported* libraries to add context information. For every currently *unsupported* module [Pass Context](#pass-context) can be used to provide transactional context to callbacks.

## API Concepts

Common concepts of the Dynatrace OneAgent SDK are explained in the [Dynatrace OneAgent SDK repository](https://github.com/Dynatrace/OneAgent-SDK).

### OneAgentSDK object

The first step is to acquire a OneAgent SDK API object by calling `createInstance()`. The resulting object holds methods to create tracers, administrative methods (e.g. check SDK state, install logging callbacks) and `passContext()`. Every call to `createInstance()` will return a new API object allowing the user to install separate logging callbacks for separate use cases.

```js
const Sdk = require('@dynatrace/oneagent-sdk');
const Api = Sdk.createInstance();
```

### Tracers

The life-cycle of a tracer is as follows:

1. Create a trace using the `traceXXX` method matching to your use case. For incoming taggable traces pass the received Dynatrace tag (if present) to the `traceXXX` method.
1. Start the trace which in turn invokes and times the given handler function.
1. For outgoing taggable traces fetch a Dynatrace tag and include it to the message being sent.
1. Optionally mark the traced operation as failed via a call to `error()`
1. End the trace once the operation is done. For outgoing traces you may pass a callback to be included in this trace.

Each tracer offers following methods:

* `start(handler, ...args)` Start a trace and calls the given handler function with the provides arguments. Returns the return value of handler.
* `startWithContext(handler, thisObj, ...args)` Like `start()` but allows to specify the `this` context for the call to handler.
* `error(err)` Mark trace as failed and attach an error object. Shall be call at max once per trace. Does not end the trace! Returns the tracer itself.
* `end()` End the trace.

Tracers for outgoing requests additionally offer enhanced methods to end a trace which allow to include the follow-up callback to the PurePath of this trace.

* `end(callback, ...args)` End the trace like `end()` but additionally calls the passed callback with given arguments. The return value from callback is forwarded to caller of `end`.
* `endWithContext(callback, thisObj, ...args)` like `end()` above but with the possibility to specify the `this` context for the callback.

Tracers for outgoing taggable requests additionally offer following methods to get a _dynatrace tag_ to be sent to remote service after the trace was started:

* `getDynatraceStringTag()` returns a Dynatrace tag encoded as `string`
* `getDynatraceByteTag()` returns a Dynatrace tag binary encoded as `Buffer`

This Dynatrace tag needs to be embedded into the message sent to remote service. The `string` or binary representation may fit better depending on the concrete protocol used. It is up to the user to decide which variant to use.
On an incoming service this tag needs to be extracted by the user and passed to the corresponding `traceXXX` method using the `dynatraceTag` property of the arguments to allow linking of outgoing and the corresponding incoming trace.

The tracer objects returned by above methods are always valid even if there is no OneAgent present or no trace is created for whatever reason. In this case the methods are still present to avoid the need of extra checking in client code.

Please note that OneAgent uses the name of the given functions in `start()` and `end()` to name PurePath nodes. Therefore we recommend to choose named functions over anonymous functions to give you higher quality traces.

## Features

The feature sets differ slightly with each language implementation. More functionality will be added over time, see [Planned features for OneAgent SDK](https://community.dynatrace.com/t5/Feedback-channel/Planned-features-for-OneAgent-SDK/m-p/147331) for details on upcoming features.

A more detailed specification of the features can be found in [Dynatrace OneAgent SDK](https://github.com/Dynatrace/OneAgent-SDK).

|Feature                                  |Required OneAgent SDK for Node.js version|
|:------                                  |:----------------------------------------|
|Trace incoming and outgoing remote calls |>=1.0.1                                  |
|Trace SQL database requests              |>=1.0.1                                  |
|Set result data on SQL database requests |>=1.1.0                                  |
|Set custom request attributes            |>=1.2.0                                  |
|Trace Messaging                          |>=1.3.0                                  |
|Metrics (deprecated)                     |>=1.4.0                                  |
|Trace context                            |>=1.5.0                                  |

### Trace incoming and outgoing remote calls

#### Trace outgoing remote calls

An outgoing remote call is traced by calling `traceOutgoingRemoteCall()` passing an object with following properties:

* `serviceMethod` Mandatory - a string holding the name of the called remote method
* `serviceName` Mandatory - a string holding the name of the remote service
* `serviceEndpoint` Mandatory - a string describing the logical endpoint of the remote service. In case of a clustered/load balanced service, the `serviceEndpoint` represents the common logical endpoint (e.g. registry://staging-environment/myservices/serviceA) whereas the ConnectionInfo describes the actual communication endpoint. As such a single serviceEndpoint can have many connections.
* `protocolName` Optional - a string describing the protocol used (e.g. Protobuf, GIOP,...), only for display purposes

Additionally it holds following properties describing the connection to the remote service. Depending on the connection type the corresponding property/properties shall be set.
If the specific information like host/socketPath/... is not available, the property `channelType` shall be set.

* `host` A string specifying the hostname/IP of the server side in case of a TCP/IP connection is used (note that OneAgent may try to resolve the hostname)
* `port` The TCP/IP port (optional)
* `socketPath` A string specifying the UNIX domain socket file
* `pipeName` A string specifying the name of the Pipe
* `channelType` Specifies the protocol used as communication channel (e.g. TCP/IP, IN_PROCESS,... ). Valid values are available via [ChannelType](#channel-type))

The result of `traceOutgoingRemoteCall()` is a tracer object to be used for further operations related to this trace (see [Tracers](#tracers) for details).
As an outgoing remote call is _taggable_ a Dynatrace tag shall be created from tracer after it has been started and embedded to the remote call message content.

**Example (see [OutgoingRemoteCallSample.js](samples/RemoteCall/OutgoingRemoteCallSample.js) for more details):**

```js
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
```

#### Trace incoming remote calls

An incoming remote call is traced by calling `traceIncomingRemoteCall()` passing an object with following properties:

* `serviceMethod` Mandatory - a string holding the name of the called remote method
* `serviceName` Mandatory - a string holding the name of the remote service
* `serviceEndpoint` Mandatory - a string describing the logical deployment endpoint of the remote service on server side
* `protocolName` Optional - a string describing the protocol used (e.g. Protobuf, GIOP,...), only for display purposes
* `dynatraceTag` - a `string` or `Buffer` holding the received Dynatrace tag received

The result of this call is a tracer object to be used for further operations related to this trace (see [Tracers](#tracers)).

**Example (see [IncomingRemoteCallSample.js](samples/RemoteCall/IncomingRemoteCallSample.js) for more details):**

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

### Trace Messaging

#### Trace outgoing messages

An outgoing message is traced by calling `traceOutgoingMessage()` passing an object with following properties:

* `vendorName` Mandatory - a string holding the messaging system vendor name (e.g. RabbitMq, Apache Kafka, ...), can be a user defined name. If possible use a constant defined in [MessageSystemVendor](#message-system-vendors).
* `destinationName` Mandatory - a string holding the destination name (e.g. queue name, topic name).
* `destinationType` Mandatory - specifies the type of the destination. Valid values are available via [MessageDestinationType](#message-destination-type)

Additionally it holds following properties describing the connection to the messaging service. Depending on the connection type the corresponding property/properties shall be set.
If the specific information like host/socketPath/... is not available, the property `channelType` shall be set.

* `host` A string specifying the hostname/IP of the server side in case of a TCP/IP connection is used (note that OneAgent may try to resolve the hostname)
* `port` The TCP/IP port (optional)
* `socketPath` A string specifying the UNIX domain socket file
* `pipeName` A string specifying the name of the Pipe
* `channelType` Specifies the protocol used as communication channel (e.g. TCP/IP, IN_PROCESS,... ). Valid values are available via [ChannelType](#channel-type))

The result of `traceOutgoingMessage()` is a tracer object to be used for further operations related to this trace (see [Tracers](#tracers) for details).
As an outgoing message is _taggable_ a Dynatrace tag shall be created from tracer after it has been started and embedded to the message content.

Besides the common APIs for outgoing tracers this tracer offers the additional methods `setVendorMessageId()` and `setCorrelationId()` which may be used to set more details about the message sent. Both APIs receive a `string` as parameter to pass the `correlationId` or `vendorMessageId` provided by messaging system.

**Example (see [MessagingSample.js](samples/Messaging/MessagingSample.js) for more details):**

```js
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
```

#### Trace incoming messages

An incoming message is traced by calling `traceIncomingMessage()` passing an object with following properties:

* `vendorName` Mandatory - a string holding the messaging system vendor name (e.g. RabbitMq, Apache Kafka, ...), can be a user defined name. If possible use a constant defined in [MessageSystemVendor](#message-system-vendors).
* `destinationName` Mandatory - a string holding the destination name (e.g. queue name, topic name).
* `destinationType` Mandatory - specifies the type of the destination. Valid values are available via [MessageDestinationType](#message-destination-type)
* `dynatraceTag` - a string or Buffer holding the received Dynatrace tag received

Additionally it holds following properties describing the connection to the messaging service. Depending on the connection type the corresponding property/properties shall be set.
If the specific information like host/socketPath/... is not available, the property `channelType` shall be set.

* `host` A string specifying the hostname/IP of the server side in case of a TCP/IP connection is used (note that OneAgent may try to resolve the hostname)
* `port` The TCP/IP port (optional)
* `socketPath` A string specifying the UNIX domain socket file
* `pipeName` A string specifying the name of the Pipe
* `channelType` Specifies the protocol used as communication channel (e.g. TCP/IP, IN_PROCESS,... ). Valid values are available via [ChannelType](#channel-type))

The result of `traceIncomingMessage()` is a tracer object to be used for further operations related to this trace (see [Tracers](#tracers) for details).

Besides the common APIs for incoming tracers this tracer offers the additional methods `setVendorMessageId()` and `setCorrelationId()` which may be used to set more details about the message sent. Both APIs receive a `string` as parameter to pass the `correlationId` or `vendorMessageId` provided by messaging system.

**Example (see [MessagingSample.js](samples/Messaging/MessagingSample.js) for more details):**

```js
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
```

### Trace SQL database requests

A SQL database request is traced by calling `traceSQLDatabaseRequest()` which requires a database info object as first argument and an object with request specific data as second parameter.

The database info is an object which usually doesn't change during runtime. It holds following properties:

* `name` Mandatory - a string defining the name of the database
* `vendor` Mandatory - a string holding the database vendor name (e.g. Oracle, MySQL, ...), can be a user defined name. If possible use a constant defined in [DatabaseVendor](#database-vendors)

Additionally, it holds following properties describing the connection to the database. Depending on the actual connection used the corresponding property/properties shall be set.
If the specific information like host/socketPath/... is not available, the property channelType shall be set.

* `host` A string specifying the hostname/IP of the server side in case of a TCP/IP connection is used (note that OneAgent may try to resolve the hostname)
* `port` The TCP/IP port (optional)
* `socketPath` A string specifying the UNIX domain socket file
* `pipeName` A string specifying the name of the pipe
* `channelType` Specifies the protocol used as communication channel (e.g. TCP/IP, IN_PROCESS,... ). Valid values are available via [ChannelType](#channel-type).

The second argument holds data describing the concrete operation and holds following properties:

* `statement` Mandatory - a string holding the SQL statement to be sent to database.

The result of `traceSQLDatabaseRequest()` is a tracer object to be used for further operations related to this trace (see [Tracers](#tracers) for details).

Besides the common APIs for outgoing tracers this tracer offers the additional method `setResultData()` which may be used to set details about the result of the database request.
It receives an object with following properties:

* `rowsReturned` Optional - Number of rows returned by this traced database request. Only positive values are allowed
* `roundTripCount` Optional - Count of round-trips that took place. Only positive values are allowed

Please note that SQL database traces are only created if they occur within some other SDK trace (e.g. incoming remote call) or a OneAgent built-in trace (e.g. incoming web request).

**Example (see [DatabaseRequestSample.js](samples/Database/DatabaseRequestSample.js) for more details):**

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
```

### Set custom request attributes

The API `addCustomRequestAttribute()` adds a custom request attribute to the currently traced service call. There is no reference to a tracer needed as OneAgent SDK will select the current open trace. This may be a trace created by SDK or
a trace created by built in sensors of OneAgent. The API may be called several times to add more attributes. If the same attribute key is set several times all values will be recorded.

`addCustomRequestAttribute()` takes two arguments:

* `key` Mandatory - a string specifying the name of the attribute
* `value` Mandatory - a string or number specifying the attribute value

**Example (see [CustomRequestAttributesSample.js](samples/CustomRequestAttributes/CustomRequestAttributesSample.js) for more details):**

```js
Api.addCustomRequestAttribute("fooAttribute", "bar");
Api.addCustomRequestAttribute("barAttribute", 15.34);
```

<a name="metrics"></a>

### Metrics (deprecated)

> **Note**: The metrics API was part of a
> [Dynatrace preview program](https://www.dynatrace.com/support/help/whats-new/preview-and-early-adopter-releases/)
> that has been **discontinued**. All metrics-related APIs and types described below
> have been **deprecated** and will be removed in a future release.
> The [Metric ingestion](https://www.dynatrace.com/support/help/how-to-use-dynatrace/metrics/metric-ingestion/)
> page provides further information on how to replace these APIs and how to report
> metrics data from now on.

The SDK supports two **metric value types**: `Integer` and `Float` (double precision floating point).
You should prefer integer metrics as they are more efficient, unless the loss of precision is unacceptable (but
consider using a different unit, e.g. integer microseconds instead of floating point seconds).

There are these different **kinds of metrics**:

* **Counter**: For all metrics that are counting something like sent/received bytes to/from network.
Counters should only be used when tracking things in flow, as opposed to state. It reports the `sum`
only and is the most lightweight metric kind.
* **Gauge**: For metrics that periodically sample a current state, e.g. temperatures, total number
of bytes stored on a disk. Gauges report a `min`, `max` and `average` value (but no `sum`).
* **Statistics**: For event-driven metrics like the packet size of a network interface. The most
heavyweight metric. Reports `min`, `max`, `average` and `count`.

Each combination of metric value type and kind has its own create-function, named `create<ValueType><MetricKind>Metric`.

When creating a metric following information needs to be provided:

* `metricName` Mandatory - a string identifying the metric. Maximum size is 100 bytes.
Although it is not recommended, you may create multiple metric instances with the same name, as long as you use the same creation function (metric value type and kind are the same) and the same options.
Otherwise, using the same metric name multiple times is an error. All metrics with the same name will be aggregated together as if you used only one metric instance.

* `MetricOptions` Optional - an `object` with following properties:
  * `unit` Optional - a string that will be displayed when browsing for metrics in the Dynatrace UI.
  * `dimensionName` Optional - a `string` specifying the name of the dimension added to the metric.
  If a name is given here it's required to set a dimension value during booking samples on the metric. A dimension is like an additional label attached to values, for example a "disk.written.bytes" metric could have a dimension name of "disk-id" and when adding values to it a dimension value would be "/dev/sda1".

### Trace context
The implementation follows the specification from [Dynatrace OneAgent SDK - Trace Context](https://github.com/Dynatrace/OneAgent-SDK#tracecontext).
For an usage example refer to [W3CTraceContextApiSample.js](samples/TraceContext/W3CTraceContextApiSample.js).

### Administrative APIs

#### Current SDK state

The method `getCurrentState()` returns the current status of SDK. Valid values are available via constant object `SDK.SDKState`:

* `ACTIVE` SDK is connected to OneAgent and capturing data.
* `TEMPORARILY_INACTIVE` SDK is connected to OneAgent, but capturing is disabled. It is good practice to skip creating SDK transactions to save resources. The SDK state should be checked regularly as it may change at every point in time.
* `PERMANENTLY_INACTIVE` SDK isn't connected to OneAgent, so it will never capture data. This SDK state will never change during the lifetime of the process. It is good practice to never call any SDK API to save resources.

#### Set callbacks for logging

The method `setLoggingCallback(callbacks)` can be used to set callbacks for warning and error logs. A logging callback receives a string as argument. As parameter pass an object with following properties:

* `warning` Optional - a function accepting a string as parameter called to pass warning messages
* `error` Optional - a function accepting a string as parameter called to pass error messages

Omitting a callback property will uninstall a previous installed callback.

```js
Api.setLoggingCallbacks({
  warning: (msg) => console.error("DatabaseRequestSample SDK warning: " + msg),
  error: (msg) => console.error("DatabaseRequestSample SDK error: " + msg),
});
```

### Constants

#### Channel type

The values of constant `ChannelType` specify the type of the transport channel used. Following values are provided:

* `TCP_IP` Communication via TCP/IP
* `UNIX_DOMAIN_SOCKET` Communication via UNIX domain socket
* `NAMED_PIPE` Communication via named pipe
* `IN_PROCESS` Communication is some mechanism within current process (e.g. via files,...)
* `OTHER` To be used for any other channel type

#### Database vendors

The values of constant `DatabaseVendor` may be used as input for `traceSQLDatabaseRequest()`. Following values are provided:

* `APACHE_HIVE`
* `CLOUDSCAPE`
* `HSQLDB`
* `PROGRESS`
* `MAXDB`
* `HANADB`
* `INGRES`
* `FIRST_SQL`
* `ENTERPRISE_DB`
* `CACHE`
* `ADABAS`
* `FIREBIRD`
* `DB2`
* `DERBY_CLIENT`
* `DERBY_EMBEDDED`
* `FILEMAKER`
* `INFORMIX`
* `INSTANT_DB`
* `INTERBASE`
* `MYSQL`
* `MARIADB`
* `NETEZZA`
* `ORACLE`
* `PERVASIVE`
* `POINTBASE`
* `POSTGRESQL`
* `SQLSERVER`
* `SQLITE`
* `SYBASE`
* `TERADATA`
* `VERTICA`
* `CASSANDRA`
* `H2`
* `COLDFUSION_IMQ`
* `REDSHIFT`
* `COUCHBASE`

#### Message destination type

The values of constant `MessageDestinationType` specify the type of the message destination used. Following values are provided:

* `QUEUE`
* `TOPIC`

#### Message system vendors

The values of constant `MessageSystemVendor` may be used as input for `traceIncomingMessage()` and `traceOutgoingMessage()`. Using these constants ensures that services captured by OneAgentSDK are handled the same way as traced via built-in sensors. Following values are provided:

* `HORNETQ`
* `ACTIVE_MQ`
* `RABBIT_MQ`
* `ARTEMIS`
* `WEBSPHERE`
* `MQSERIES_JMS`
* `MQSERIES`
* `TIBCO`
* `KAFKA`

### Pass Context

Dynatrace transparently wraps *supported* libraries to add context information. For every yet *unsupported* module `passContext()` can be used to provide transactional context to callbacks.

**What is transactional context?**

[Dynatrace patented PurePath Technology®](https://www.dynatrace.com/en_us/application-performance-management/products/purepath-technology.html) captures timing and code level context for *all* transactions, end-to-end, from user click, across all tiers, to the database of record and back. Technically this means that Dynatrace adds transactional context to any inbound and outbound function calls of an application.

**What does this mean for Node.js applications?**

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

After `collection.findOne()` is executed asynchronously `callback()` will be called. `callback()` again contains an asynchronous call `http.get()` which performs an outbound HTTP request. If there is a current transactional context with an ongoing trace, Dynatrace OneAgent will transparently add a HTTP header containing a Dynatrace tag to this outbound request. The next tier - if instrumented with OneAgent - will continue this trace then. Without further intervention any transactional context would be lost between asynchronous invocation and a callback. Currently the only reliable way to pass over context information to a callback is called 'wrapping'.

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

**Important: The wrapping via `passContext()` needs to happen call time of the corresponding sync call**

```js
// This will *NOT* work as transactional context at call time of some.asyncFunction() is not preserved
// instead the transactional context at definition of doSomething() is preserved which is not
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

## Further readings

* [What is the OneAgent SDK?](https://www.dynatrace.com/support/help/extend-dynatrace/oneagent-sdk/what-is-oneagent-sdk/) in the Dynatrace documentation
* [Feedback & Roadmap thread in dynatrace community](https://community.dynatrace.com/t5/Feedback-channel/Planned-features-for-OneAgent-SDK/m-p/147331)
* [Dynatrace OneAgent SDK for Node.js: Extend end-to-end visibility](https://www.dynatrace.com/news/blog/dynatrace-oneagent-sdk-for-node-js-extend-end-to-end-visibility/)

## Help & Support

**Support policy**

The Dynatrace OneAgent SDK for Node.js has GA status. The features are fully supported by Dynatrace.

For detailed support policy see [Dynatrace OneAgent SDK help](https://github.com/Dynatrace/OneAgent-SDK#help).

### Get Help

* Ask a question in the [product forums](https://community.dynatrace.com/)
* Read the [product documentation](https://www.dynatrace.com/support/help)

### Open a [GitHub issue](https://github.com/Dynatrace/OneAgent-SDK-for-NodeJs/issues) to

* Report minor defects, minor items or typos
* Ask for improvements or changes in the SDK API
* Ask any questions related to the community effort

SLAs don't apply for GitHub tickets

### Customers can open a ticket on the [Dynatrace support portal](https://dt-url.net/lb626l9) to

* Get support from the Dynatrace technical support engineering team
* Manage and resolve product related technical issues

SLAs apply according to the customer's support level.

## Release Notes

see also [Releases](https://github.com/Dynatrace/OneAgent-SDK-for-NodeJs/releases)

|Version|Description                                              |
|:------|:--------------------------------------------------------|
|1.5.0  |deprecate old SDK Versions, add TraceContextInfo support |
|1.4.1  |deprecate metrics-related types and APIs                 |
|1.4.0  |add support for metrics (preview only)                   |
|1.3.0  |add support to trace messaging                           |
|1.2.2  |don't swallow exceptions                                 |
|1.2.1  |improve type definitions                                 |
|1.2.0  |add support for custom request attributes                |
|1.1.0  |add setResultData() for SQL Database tracer              |
|1.0.3  |early access to beta                                     |
|1.0.1  |Initial release                                          |
