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

import { getDummySdk } from "./Stub";

import * as DbVendors from "./DatabaseVendors";
import * as MessageSystemVendors from "./MessageSystemVendors";

export { DbVendors as DatabaseVendor };
export { MessageSystemVendors as MessageSystemVendor };


// ============================================================================

// declare global function implemented by OneAgent - if present
type GetAgentApi = (version: number) => OneAgentSDK | undefined;
declare const __DT_GETAGENTAPI__: GetAgentApi | undefined;


// ============================================================================
// common interfaces/types

/**
 * Defines the state, in which the SDK can be.
 */
export const enum SDKState {
	/// SDK is connected to OneAgent and capturing data.
	ACTIVE,

	/// SDK is connected to OneAgent, but capturing is disabled. It is good practice to skip creating SDK transactions to save resources.
	TEMPORARILY_INACTIVE,

	/// SDK isn't connected to OneAgent, so it will never capture data.
	PERMANENTLY_INACTIVE
}

/**
 * Specifies the protocol used as communication channel.
 */
export const enum ChannelType {
	/// To be used for other protocols
	OTHER,

	/// TCP/IP
	TCP_IP,

	/// Unix Domain socket
	UNIX_DOMAIN_SOCKET,

	/// Name Pipe
	NAMED_PIPE,

	/// Communication is in process (e.g. using files,..)
	IN_PROCESS
}


/**
 * Common information specifying how a connection is done.
 * - For TCP/IP connections set host and optional port
 * - For Unix domain sockets set socketPath
 * - For named pipes set pipeName
 * In case no detailed information is available set the channelType field.
 */
export interface ConnectionInfo {
	/// The hostname/IP of the server-side in case a TCP/IP connection is used
	host?: string;
	/// The port in case a TCP/IP connection is used
	port?: number;

	/// The path of the UNIX domain socket file
	socketPath?: string;

	/// The name of the pipe
	pipeName?: string;

	/// Set this field if no other field can be set
	channelType?: ChannelType;
}


/// Callback used to pass log messages to user
export type LoggingCallback = (message: string) => void;

/**
 * Specifies callbacks for logging.
 * Passing undefined uninstalls a previous installed callback.
 */
export interface LoggingCallbacks {
	/// Callback for warnings. Something is missing/incorrect, but agent is working normal.
	warning?: LoggingCallback;

	/// Callback for errors (something that should be done can't be done e. g. path couldn't be started).
	error?: LoggingCallback;
}

// ============================================================================
export interface Tracer {
	/**
	 * Start the trace and calls the given handler.
	 * Similar to startWithContext() but without the possiblity to specifiy the context/this (undefined is used).
	 * @param handler The handler function triggering the actual request to be traced
	 * @param args The arguments to be passed to handler
	 * @returns The return value of handler
	 */
	start<R, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10>(handler: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9, _10: P10) => R,
											_1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9, _10: P10): R;
	start<R, P1, P2, P3, P4, P5, P6, P7, P8, P9>(handler: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9) => R,
											_1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9): R;
	start<R, P1, P2, P3, P4, P5, P6, P7, P8>(handler: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8) => R,
											_1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8): R;
	start<R, P1, P2, P3, P4, P5, P6, P7>(handler: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7) => R,
											_1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7): R;
	start<R, P1, P2, P3, P4, P5, P6>(handler: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6) => R, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6): R;
	start<R, P1, P2, P3, P4, P5>(handler: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5) => R, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5): R;
	start<R, P1, P2, P3, P4>(handler: (this: void, _1: P1, _2: P2, _3: P3, _4: P4) => R, _1: P1, _2: P2, _3: P3, _4: P4): R;
	start<R, P1, P2, P3>(handler: (this: void, _1: P1, _2: P2, _3: P3) => R, _1: P1, _2: P2, _3: P3): R;
	start<R, P1, P2>(handler: (this: void, _1: P1, _2: P2) => R, _1: P1, _2: P2): R;
	start<R, P1>(handler: (this: void, _1: P1) => R, _1: P1): R;
	start<R>(handler: (this: void) => R ): R;


	/**
	 * Start the trace and calls the given handler function with specified context (this).
	 * Similar as start() but requires to specify the context/this for the function.
	 * @param handler The handler function triggering the actual request to be traced
	 * @param thisObj The context/this object passed to handler
	 * @param args The arguments to be passed to handler
	 * @returns The return value of handler
	 */
	startWithContext<R, T, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10>(handler: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9, _10: P10) => R,
											thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9, _10: P10): R;
	startWithContext<R, T, P1, P2, P3, P4, P5, P6, P7, P8, P9>(handler: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9) => R,
											thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9): R;
	startWithContext<R, T, P1, P2, P3, P4, P5, P6, P7, P8>(handler: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8) => R,
											thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8): R;
	startWithContext<R, T, P1, P2, P3, P4, P5, P6, P7>(handler: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7) => R,
											thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7): R;
	startWithContext<R, T, P1, P2, P3, P4, P5, P6>(handler: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6) => R, thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6): R;
	startWithContext<R, T, P1, P2, P3, P4, P5>(handler: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5) => R, thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5): R;
	startWithContext<R, T, P1, P2, P3, P4>(handler: (this: T, _1: P1, _2: P2, _3: P3, _4: P4) => R, thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4): R;
	startWithContext<R, T, P1, P2, P3>(handler: (this: T, _1: P1, _2: P2, _3: P3) => R, thisObj: T, _1: P1, _2: P2, _3: P3): R;
	startWithContext<R, T, P1, P2>(handler: (this: T, _1: P1, _2: P2) => R, thisObj: T, _1: P1, _2: P2): R;
	startWithContext<R, T, P1>(handler: (this: T, _1: P1) => R, thisObj: T, _1: P1): R;
	startWithContext<R, T>(handler: (this: T) => R, thisObj: T): R;

	/**
	 * Mark a trace as failed.
	 * Only to be called once, concatenation of errors has to be handled by user. DOES NOT end the tracer.
	 * @param err The error object to attach
	 * @returns The tracer itself
	 */
	error(err: any): this;
}

export interface IncomingTracer extends Tracer {
	/**
	 * End trace.
	 */
	end(): void;
}

export interface OutgoingTracer extends Tracer {
	/**
	 * End tracer and calls the given callback function.
	 * Similar to endWithContext() but without the possiblity to specifiy the context/this (undefined is used).
	 * @param callback An optional callback function executing the followup tasks of the traced request.
	 * @param args The arguments to be passed to callback.
	 * @returns the callback return value or undefined if there is no callback
	 */
	end<R, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10>(callback: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9, _10: P10) => R,
											_1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9, _10: P10): R;
	end<R, P1, P2, P3, P4, P5, P6, P7, P8, P9>(callback: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9) => R,
											_1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9): R;
	end<R, P1, P2, P3, P4, P5, P6, P7, P8>(callback: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8) => R,
											_1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8): R;
	end<R, P1, P2, P3, P4, P5, P6, P7>(callback: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7) => R,
											_1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7): R;
	end<R, P1, P2, P3, P4, P5, P6>(callback: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6) => R, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6): R;
	end<R, P1, P2, P3, P4, P5>(callback: (this: void, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5) => R, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5): R;
	end<R, P1, P2, P3, P4>(callback: (this: void, _1: P1, _2: P2, _3: P3, _4: P4) => R, _1: P1, _2: P2, _3: P3, _4: P4): R;
	end<R, P1, P2, P3>(callback: (this: void, _1: P1, _2: P2, _3: P3) => R, _1: P1, _2: P2, _3: P3): R;
	end<R, P1, P2>(callback: (this: void, _1: P1, _2: P2) => R, _1: P1, _2: P2): R;
	end<R, P1>(callback: (this: void, _1: P1) => R, _1: P1): R;
	end<R>(callback: (this: void) => R): R;
	end(): void;


	/**
	 * End tracer and calls the given callback function with specified context (this).
	 * @param callback An optional callback function executing the followup tasks of the traced request.
	 * @param thisObj The this object passed to the callback
	 * @param args The arguments to be passed to callback
	 * @returns the callback return value or undefined if there is no callback
	 */
	endWithContext<R, T, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10>(callback: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9, _10: P10) => R,
											thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9, _10: P10): R;
	endWithContext<R, T, P1, P2, P3, P4, P5, P6, P7, P8, P9>(callback: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9) => R,
											thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8, _9: P9): R;
	endWithContext<R, T, P1, P2, P3, P4, P5, P6, P7, P8>(callback: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8) => R,
											thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7, _8: P8): R;
	endWithContext<R, T, P1, P2, P3, P4, P5, P6, P7>(callback: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7) => R,
											thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6, _7: P7): R;
	endWithContext<R, T, P1, P2, P3, P4, P5, P6>(callback: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6) => R, thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5, _6: P6): R;
	endWithContext<R, T, P1, P2, P3, P4, P5>(callback: (this: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5) => R, thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4, _5: P5): R;
	endWithContext<R, T, P1, P2, P3, P4>(callback: (this: T, _1: P1, _2: P2, _3: P3, _4: P4) => R, thisObj: T, _1: P1, _2: P2, _3: P3, _4: P4): R;
	endWithContext<R, T, P1, P2, P3>(callback: (this: T, _1: P1, _2: P2, _3: P3) => R, thisObj: T, _1: P1, _2: P2, _3: P3): R;
	endWithContext<R, T, P1, P2>(callback: (this: T, _1: P1, _2: P2) => R, thisObj: T, _1: P1, _2: P2): R;
	endWithContext<R, T, P1>(callback: (this: T, _1: P1) => R, thisObj: T, _1: P1): R;
	endWithContext<R, T>(callback: (this: T) => R, thisObj: T): R;
}

/**
 * Common interface for incoming requests which include tagging.
 * Not to be directly used by SDK user.
 */
export interface IncomingTaggable {
	/// Dynatrace tag as received
	dynatraceTag?: string | Buffer;
}

/**
 * Common interface for outgoing requests which include tagging.
 * Not to be directly used by SDK user.
 */
export interface OutgoingTaggable {
	/**
	 * Get a dynatrace tag as string.
	 * @return tag to be sent as string
	 */
	getDynatraceStringTag(): string;

	/**
	 * Get a dynatrace tag as binary buffer.
	 * @return tag to be sent as Buffer
	 */
	getDynatraceByteTag(): Buffer;
}

// ============================================================================

// Types for Database

/**
 * Description of a database.
 */
export interface DatabaseInfoCommon extends ConnectionInfo {
	/// The name of the database
	name: string;

	/// The database vendor name (e.g. Oracle, MySQL, ...) can be an user defined name. If possible use a constant defined in DatabaseVendor.
	vendor: string;
}

export interface DatabaseInfoTcp extends DatabaseInfoCommon {
	host: string;
	port?: number;
}

export interface DatabaseInfoDomainSocket extends DatabaseInfoCommon {
	socketPath: string;
}

export interface DatabaseInfoPipe extends DatabaseInfoCommon {
	pipeName: string;
}

export interface DatabaseInfoChannelType extends DatabaseInfoCommon {
	channelType: ChannelType;
}

export type DatabaseInfo = DatabaseInfoTcp | DatabaseInfoDomainSocket | DatabaseInfoPipe | DatabaseInfoChannelType;

/**
 *  Specifies the SQL DatabaseTracer start data
 */
export interface SQLDatabaseRequestStartData {
	/// Database SQL statement
	statement: string;
}

export interface SQLDatabaseRequestResultData {
	/// Number of rows returned by this traced database request. Only positive values are allowed
	rowsReturned?: number;

	/// Count of round-trips that took place. Only positive values are allowed
	roundTripCount?: number;
}

/**
 * Tracer for a database request.
 * Created by {@link traceSQLDatabaseRequest}
 */
export interface DatabaseRequestTracer extends OutgoingTracer {
	/**
	 * Adds optional information about retrieved rows of the traced database request.
	 * Use is optional. Must be called before end() of this tracer is being called.
	 */
	setResultData(resultData: SQLDatabaseRequestResultData): this;
}

// ============================================================================

// Types for IncomingRemoteCall

/**
 *  Specifies the start data for an incoming remote call
 */
export interface IncomingRemoteCallStartData extends IncomingTaggable {
	/// Name of the called remote method
	serviceMethod: string;

	/// Name of the remote service
	serviceName: string;

	/// Logical deployment endpoint on the server side
	serviceEndpoint: string;

	/// The name of the protocol, only for display purposes
	protocolName?: string;
}

/**
 * Tracer for a incoming remote call
 * Created by {@link traceIncomingRemoteCall}
 */
export interface IncomingRemoteCallTracer extends IncomingTracer {
}

// ============================================================================

// Types for OutgoingRemoteCall

/**
 * Specifies the start data for an outgoing remote call.
 */
export interface OutgoingRemoteCallStartDataCommon extends ConnectionInfo {
	/// Name of the called remote method
	serviceMethod: string;

	/// Name of the remote service
	serviceName: string;

	/**
	 * Logical deployment endpoint on the server side.
	 * In case of a clustered/load balanced service, the serviceEndpoint represents the common logical endpoint (e.g. registry://staging-environment/myservices/serviceA)
	 * where as the ConnectionInfo describes the actual communication endpoint. As such a single serviceEndpoint can have many connections.
	 */
	serviceEndpoint: string;

	/// The name of the protocol, only for display purposes
	protocolName?: string;
}

export interface OutgoingRemoteCallStartDataTcp extends OutgoingRemoteCallStartDataCommon {
	host: string;
	port?: number;
}

export interface OutgoingRemoteCallStartDataDomainSocket extends OutgoingRemoteCallStartDataCommon {
	socketPath: string;
}

export interface OutgoingRemoteCallStartDataPipe extends OutgoingRemoteCallStartDataCommon {
	pipeName: string;
}

export interface OutgoingRemoteCallStartDataChannelType extends OutgoingRemoteCallStartDataCommon {
	channelType: ChannelType;
}

export type OutgoingRemoteCallStartData = OutgoingRemoteCallStartDataTcp | OutgoingRemoteCallStartDataDomainSocket | OutgoingRemoteCallStartDataPipe | OutgoingRemoteCallStartDataChannelType;

/**
 * Tracer for an outgoing remote call.
 * Created by {@link traceOutgoingRemoteCall}
 */
export interface OutgoingRemoteCallTracer extends OutgoingTaggable, OutgoingTracer {
}

// ============================================================================

// Types for Messaging

/**
 * Defines the destination type of a message.
 */
export const enum MessageDestinationType {
	QUEUE,

	TOPIC
}

export interface MessagingSystemInfoCommon extends ConnectionInfo {
	/// The message system vendor name (e.g. RabbitMq, Apache Kafka, ...) can be an user defined name. If possible use a constant defined in MessageSystemVendor.
	vendorName: string;

	/// destination name (e.g. queue name, topic name)
	destinationName: string;

	/// destination type: 'Topic' or 'Queue'
	destinationType: MessageDestinationType;
}

export interface IncomingMessageStartDataCommon extends MessagingSystemInfoCommon, IncomingTaggable {
}

export interface IncomingMessageStartDataTcp extends IncomingMessageStartDataCommon {
	host: string;
	port?: number;
}

export interface IncomingMessageStartDataSocket extends IncomingMessageStartDataCommon {
	socketPath: string;
}

export interface IncomingMessageStartDataPipe extends IncomingMessageStartDataCommon {
	pipeName: string;
}

export interface IncomingMessageStartDataChannelType extends IncomingMessageStartDataCommon {
	channelType: ChannelType;
}

export type IncomingMessageStartData = IncomingMessageStartDataTcp | IncomingMessageStartDataSocket | IncomingMessageStartDataPipe | IncomingMessageStartDataChannelType;


export interface OutgoingMessageStartDataCommon extends MessagingSystemInfoCommon {
}
export interface OutgoingMessageStartDataTcp extends OutgoingMessageStartDataCommon {
	host: string;
	port?: number;
}

export interface OutgoingMessageStartDataDomainSocket extends MessagingSystemInfoCommon {
	socketPath: string;
}

export interface OutgoingMessageStartDataPipe extends MessagingSystemInfoCommon {
	pipeName: string;
}

export interface OutgoingMessageStartDataChannelType extends MessagingSystemInfoCommon {
	channelType: ChannelType;
}

export type OutgoingMessageStartData = OutgoingMessageStartDataTcp | OutgoingMessageStartDataDomainSocket | OutgoingMessageStartDataPipe | OutgoingMessageStartDataChannelType;


export interface MessageTracerCommon {
	/**
	 * Adds optional information about a traced message: message id provided by messaging system.
	 * @param vendorMessageId the messageId
	 */
	setVendorMessageId(vendorMessageId: string): this;

	/**
	 * Adds optional information about a traced message: correlation id used by messaging system.
	 * @param correlationId correlationId
	 */
	setCorrelationId(correlationId: string): this;
}

/**
 * Tracer for an outgoing message.
 * Created by {@link traceOutgoingMessage}
 */
export interface OutgoingMessageTracer extends OutgoingTaggable, OutgoingTracer, MessageTracerCommon {
}

/**
 * Tracer for processing an incoming message.
 * Created by {@link traceIncomingMessage}
 */
export interface IncomingMessageTracer extends IncomingTaggable, IncomingTracer, MessageTracerCommon {
}

// ============================================================================

// Types for Metrics

/**
 * @deprecated This interface is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
 */
export interface MetricOptions {
	/**
	 * Unit of the metric. Only informational and used as label only.
	 * Note that you must not report the same metric with different dimensions, as that would lead to incorrect aggregation.
	 * If you cannot ensure consistent units, use a different metric key per unit, e.g. "NORMAL-METRIC-KEY.UNIT-NAME".
	 */
	unit?: string;
}

/**
 * @deprecated This interface is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
 */
export interface MetricOptionsWithDimension extends MetricOptions {
	/**
	 * Name of dimension. Only informational and used as label only.
	 * Must be set to non-empty string, when dimension will be reported. If no dimension will be reported dimension shall be not set.
	 */
	dimensionName: string;
}

/**
 * @deprecated This interface is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
 */
export interface CounterMetricDimensionLess {
	/**
	 * Increase the counter by provided value.
	 * @param value				The value to increase the metric
	 */
	increaseBy(value: number): void;
}

/**
 * @deprecated This interface is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
 */
export interface CounterMetricWithDimension {
	/**
	 * Increase the counter by provided value.
	 * @param value				The value to increase the metric
	 * @param dimensionValue	Name of the concerned resource (disk name, page name, ...).
	 */
	increaseBy(value: number, dimensionValue: string): void;
}

/**
 * @deprecated This interface is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
 */
export interface GaugeMetricDimensionLess {
	/**
	 * Set the current value.
	 * @param value				The current value to set
	 */
	setValue(currentValue: number): void;
}

/**
 * @deprecated This interface is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
 */
export interface GaugeMetricWithDimension {
	/**
	 * Set the current value.
	 * @param value				The current value to set
	 * @param dimensionValue	Name of the concerned resource (disk name, page name, ...).
	 */
	setValue(currentValue: number, dimensionValue: string): void;
}

/**
 * @deprecated This interface is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
 */
export interface StatisticsMetricDimensionLess {
	/**
	 * Adds new value to this statistics metric.
	 * @param value				The value to be recorded to the statistic
	 */
	addValue(value: number): void;
}

/**
 * @deprecated This interface is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
 */
export interface StatisticsMetricWithDimension {
	/**
	 * Adds new value to this statistics metric.
	 * @param value				The value to be recorded to the statistic
	 * @param dimensionValue	Name of the concerned resource (disk name, page name, ...).
	 */
	addValue(value: number, dimensionValue?: string): void;
}

export const invalidSpanId = "0000000000000000";
export const invalidTraceId = "00000000000000000000000000000000";

/**
 * TraceContextInfo is used to carry the traceid and spanid internally used in OneAgent
 */
export interface TraceContextInfo {
	isValid: boolean;
	traceid: string;
	spanid: string;
}

// ============================================================================

/**
 * Object holding all SDK apis.
 */
export interface OneAgentSDK {
	/**
	 * Create a function closure capturing current transaction context.
	 * @param func The function which should capture the transactional context
	 * @return a function with same prototype as func to be used instead of func
	 */
	passContext<T extends Function>(func: T): T;	// tslint:disable-line:ban-types

	// **************** Apis to create Tracers ********************

	/**
	 * Traces an (outgoing) SQL database request.
	 * @param databaseInfo Information about database
	 * @param startData Specifies details about the request
	 * @return {@link DatabaseRequestTracer} to work with
	 */
	traceSQLDatabaseRequest(databaseInfo: DatabaseInfo, startData: SQLDatabaseRequestStartData): DatabaseRequestTracer;

	/**
	 * Traces a local incoming remote call (from the same machine).
	 * @param startData Specifies details about the request
	 * @return {@link IncomingRemoteCallTracer} to work with
	 */
	traceIncomingRemoteCall(startData: IncomingRemoteCallStartData): IncomingRemoteCallTracer;

	/**
	 * Traces an outgoing remote call.
	 * @param startData Specifies details about the request
	 * @return {@link OutgoingRemoteCallTracer} to work with
	 */
	traceOutgoingRemoteCall(startData: OutgoingRemoteCallStartData): OutgoingRemoteCallTracer;

	/**
	 * Creates a tracer for processing (consuming) a received message (onMessage).
	 * @param startData Specifies details about the request
	 * @return {@link IncomingMessageTracer} to work with
	 */
	traceIncomingMessage(startData: IncomingMessageStartData): IncomingMessageTracer;

	/**
	 * Creates a tracer for an outgoing asynchronous message (send).
	 *
	 * @param startData Specifies details about the request
	 * @return {@link OutgoingMessageTracer} to work with
	 */
	traceOutgoingMessage(startData: OutgoingMessageStartData): OutgoingMessageTracer;

	// ***** Custom request attributes *****
	/**
	 * Adds a custom request attribute to currently traced service call. Might be called multiple times, to add more than one attribute.
	 * Check via {@link #setLoggingCallback(LoggingCallback)} if an error happened. If two attributes with same key are set, both
	 * attribute-values are captured.
	 *
	 * @param key Key of the attribute.
	 * @param value Value of the attribute.
	 */
	addCustomRequestAttribute(key: string, value: string | number): void;


	// ***** Metrics *****

	/**
	 * Creates an integer counter metric instance. Counters are used for all metrics, that are counting something like sent/received
	 * bytes to/from network.
	 *
	 * Counter sums up provided samples and reports the sum only.
	 *
	 * @deprecated This function is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
	 *
	 * @param metricName	Name (tenant-wide ID) of the metric. It must be ASCII-compatible, must not contain NUL characters
	 * 						and must not be longer than 100 bytes.
	 * @param options		optional options for the metric.
	 * @return	The metric instance being used for reporting. Returned instances should be reused whenever possible.
	 *			Calling this method twice or more with same metric key might return same instance.
	 */
	createIntegerCounterMetric(metricName: string, options?: MetricOptions): CounterMetricDimensionLess;
	createIntegerCounterMetric(metricName: string, options: MetricOptionsWithDimension): CounterMetricWithDimension;

	/**
	 * Floating point variant of {@link #createIntegerCounterMetric}.
	 *
	 * @deprecated This function is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
	 *
	 * @param metricName	same restrictions apply as for metricName in {@link #createIntegerCounterMetric}
	 * @param options 		see {@link #createIntegerCounterMetric}
	 * @return For details see return value of {@link #createIntegerCounterMetric}.
	 */
	createFloatCounterMetric(metricName: string, options?: MetricOptions): CounterMetricDimensionLess;
	createFloatCounterMetric(metricName: string, options: MetricOptionsWithDimension): CounterMetricWithDimension;

	/**
	 * Creates an integer gauge metric instance. Gauges can be used for metrics describing a current state like
	 * temperature, number of items in a cache.
	 *
	 * Gauges are intended for periodical sampling and reporting min, max and average of provided samples.
	 *
	 * @deprecated This function is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
	 *
	 * @param metricName	same restrictions apply as for metricName in {@link #createIntegerCounterMetric}
	 * @param options 		see {@link #createIntegerCounterMetric}
	 * @return For details see return value of {@link #createIntegerCounterMetric}.
	 */
	createIntegerGaugeMetric(metricName: string, options?: MetricOptions): GaugeMetricDimensionLess;
	createIntegerGaugeMetric(metricName: string, options: MetricOptionsWithDimension): GaugeMetricWithDimension;

	/**
	 * Floating point variant of {@link #createIntegerGaugeMetric}.
	 *
	 * @deprecated This function is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
	 *
	 * @param metricName	same restrictions apply as for metricName in {@link #createIntegerCounterMetric}
	 * @param options 		see {@link #createIntegerCounterMetric}
	 * @return For details see return value of {@link #createIntegerCounterMetric}.
	 */
	createFloatGaugeMetric(metricName: string, options?: MetricOptions): GaugeMetricDimensionLess;
	createFloatGaugeMetric(metricName: string, options: MetricOptionsWithDimension): GaugeMetricWithDimension;

	/**
	 * Creates an integer statistics metric instance. Statistics can/should be used for event driven metrics like
	 * packet size of network interface.
	 *
	 * Statistics are reporting min, max, average and count.
	 *
	 * @deprecated This function is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
	 *
	 * @param metricName	same restrictions apply as for metricName in {@link #createIntegerCounterMetric}
	 * @param options 		see {@link #createIntegerCounterMetric}
	 * @return For details see return value of {@link #createIntegerCounterMetric}.
	 */
	createIntegerStatisticsMetric(metricName: string, options?: MetricOptions): StatisticsMetricDimensionLess;
	createIntegerStatisticsMetric(metricName: string, options: MetricOptionsWithDimension): StatisticsMetricWithDimension;

	/**
	 * Floating point variant of {@link #createIntegerStatisticsMetric}.
	 *
	 * @deprecated This function is obsolete. Refer to https://github.com/Dynatrace/OneAgent-SDK-for-nodejs#metrics for details.
	 *
	 * @param metricName	same restrictions apply as for metricName in {@link #createIntegerCounterMetric}
	 * @param options 		see {@link #createIntegerCounterMetric}
	 * @return For details see return value of {@link #createIntegerCounterMetric}.
	 */
	createFloatStatisticsMetric(metricName: string, options?: MetricOptions): StatisticsMetricDimensionLess;
	createFloatStatisticsMetric(metricName: string, options: MetricOptionsWithDimension): StatisticsMetricWithDimension;


	// ***** various *****

	/**
	 * Returns the current SDKState. See {@link SDKState} for details.
	 * @return current state.
	 */
	getCurrentState(): SDKState;

	/**
	 * Installs callbacks, that get called if any SDK action has failed.
	 * Passing undefined uninstalls a previous installed callback.
	 * @param callbacks Specifies callbacks for logging
	 */
	setLoggingCallbacks(callbacks?: LoggingCallbacks): void;

	// ***** trace context *****

	/**
	 * Provides TraceContext information about the currently active trace.
	 * It uses the TraceContext (TraceId, SpanId) model as defined
	 * in https://www.w3.org/TR/trace-context.
	 * The returned information is not intended for tagging and context-propagation
	 * scenarios and primarily designed for log-enrichment use cases.
	 *
	 * @return see {@link TraceContextInfo} for more details.
	 */
	getTraceContextInfo(): TraceContextInfo;
}


// ----------------------------------------------------------------------------
/**
 * Creates an SDK API object offering APIs to OneAgent.
 * @return {@link OneAgentSDK} to work with
 */
export function createInstance(): OneAgentSDK {
	if (typeof __DT_GETAGENTAPI__ === "function") {
		return  __DT_GETAGENTAPI__(9) || getDummySdk();
	}

	return getDummySdk();
}
