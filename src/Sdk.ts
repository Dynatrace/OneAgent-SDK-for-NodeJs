/*
    Copyright 2018 Dynatrace LLC

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

import * as Vendors from "./DatabaseVendors";
export { Vendors as DatabaseVendor };


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
	/** SDK is connected to OneAgent and capturing data. */
	ACTIVE,

	/**
	 * SDK is connected to OneAgent, but capturing is disabled. It is good practice to skip creating SDK transactions to save resources.
	 */
	TEMPORARILY_INACTIVE,

	/**
	 * SDK isn't connected to OneAgent, so it will never capture data.
	 */
	PERMANENTLY_INACTIVE
}

/**
 * Specifies the type used as communication channel.
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

	/// Communication is in process (e.a. using files,..)
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
	/// The hostname in case a TCP/IP connection is used
	host?: string;
	// The port in case a TCP/IP connection is used
	port?: number;


	/// The path of the UNIX domain socket used
	socketPath?: string;


	/// The name of the pipe used
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
export interface DatabaseInfo extends ConnectionInfo {
	/// The name of the database
	name: string;

	/// The database vendor name (e.a. Oracle, MySQL, ...), can be an user defined name or one of the contants in DatabaseVendor
	vendor: string;
}

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
	/** Adds optional information about retrieved rows of the traced database request.
	 *  Use is optional. Must be called before end() of this tracer is being called.
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

	// Endpoint on the local machine
	serviceEndpoint: string;

	/// The name of the protocol
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
 *  Specifies the start data for an outgoing remote call.
 */
export interface OutgoingRemoteCallStartData extends ConnectionInfo {
	/// Name of the called remote method
	serviceMethod: string;

	/// Name of the remote service
	serviceName: string;

	/// Endpoint of the remote service
	serviceEndpoint: string;

	/// The name of the protocol
	protocolName?: string;
}

/**
 * Tracer for an outgoing remote call.
 * Created by {@link traceOutgoingRemoteCall}
 */
export interface OutgoingRemoteCallTracer extends OutgoingTaggable, OutgoingTracer {
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

	// Apis to create Tracers

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
}


// ----------------------------------------------------------------------------
/**
 * Creates an SDK API object offering APIs to OneAgent.
 * @return {@link OneAgentSDK} to work with
 */
export function createInstance(): OneAgentSDK {
	if (typeof __DT_GETAGENTAPI__ === "function") {
		return  __DT_GETAGENTAPI__(5) || getDummySdk();
	}

	return getDummySdk();
}
