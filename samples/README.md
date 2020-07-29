# Sample applications for OneAgent SDK for Node.JS

Sample applications showing how to use Dynatrace OneAgent SDK for Node.js to create custom specific PurePaths and service calls.

## Contents

- `Database`: Shows use of SDK APIs for database requests
- `RemoteCall`: Shows use of SDK APIs for remote calls (incoming and outgoing)
- `Messaging`: Shows use of SDK APIs for messaging (incoming and outgoing)
- `CustomRequestAttributes`: Shows use of SDK APIs to set custom request attributes
- `Metrics`: Shows use of SDK APIs for metrics reporting

## Prepare running sample applications

- Ensure Dynatrace OneAgent is installed. If not see our [free Trial](https://www.dynatrace.com/trial/?vehicle_name=https://github.com/Dynatrace/OneAgent-SDK-for-NodeJs)
- Ensure you have [Node.Js](https://nodejs.org "Node.js") installed.
- clone this repository
- Execute `npm install` in folder `samples`

## Database sample application

This sample shows how to trace a request to a SQL database. No real database is actually used, it's simulated in the sample.
Database request generate services only if executed within another service, therefore the simple http server is used to host this.

Execute the sample by via `npm run database` or `node Database/DatabaseRequestSample` in folder samples.
Check your Dynatrace environment for newly created services.

## RemoteCall sample application

This sample shows how to trace an outgoing and incoming remote call and how to add a dynatrace trace tag to get linked service calls.
In OutgoingRemoteCallSample.js a child process is spawened (executing IncomingRemoteCallSample.js) and these two processes communicate via Node.Js built in child process IPC.

Execute the sample via `npm run remotecall` or `node RemoteCall/OutgoingRemoteCallSample` in folder samples.
Check your Dynatrace environment for newly created services.

## Messaging sample application

This sample shows how to trace outgoing and incoming messaging and how to add a dynatrace trace tag to get linked service calls.

Execute the sample via `npm run messaging` or `node Messaging/MessagingSample` in folder samples.
Check your Dynatrace environment for newly created services.

## CustomRequestAttributes sample application

This sample shows how to set custom request attributes.
The OneAgent will create a trace for the incoming web request and client code can add attributes to this trace as long as it is open.

Execute the sample via `npm run customrequestattribute` or `node CustomRequestAttributes/CustomRequestAttributesSample.js` in folder samples.
Check your Dynatrace environment for newly created services.

## Metrics sample application

This sample shows how to report metrics.

Execute the sample via `npm run metrics` or `node Metrics/MetricsSample.js` in folder samples.
Check your Dynatrace environment for newly reported metrics.
