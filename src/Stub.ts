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

import * as Sdk from "./Sdk";

// ============================================================================


class DummyTracer implements Sdk.Tracer {
	public start<R>(handler: (...args: any[]) => R, ...args: any[]): R {
		return handler.call(undefined, ...args);
	}

	public startWithContext<R>(handler: (...args: any[]) => R, thisObj?: any, ...args: any[]): R {
		return handler.call(thisObj, ...args);
	}

	public error(): this {
		return this;
	}
}

class DummyIncomingTracer extends DummyTracer implements Sdk.IncomingTracer {
	public end(): void {
		// empty
	}
}

class DummyOutgoingTracer extends DummyTracer implements Sdk.OutgoingTracer {
	public end<R>(handler?: (...args: any[]) => R, ...args: any[]): R | undefined {
		return this.endWithContext(handler, undefined, ...args);
	}

	public endWithContext<R>(handler?: (...args: any[]) => R, thisObj?: any, ...args: any[]): R | undefined {
		if (typeof handler === "function") {
			return handler.call(thisObj, ...args);
		}
		return undefined;
	}
}

class DummyOutgoingTaggableTracer extends DummyOutgoingTracer implements Sdk.Tracer, Sdk.OutgoingTaggable {
	public getDynatraceStringTag(): string {
		return "";
	}
	public getDynatraceByteTag(): Buffer {
		return new Buffer("");
	}
}

class DummyDatabaseRequestTracer extends DummyOutgoingTracer implements Sdk.DatabaseRequestTracer {
	public setResultData(): this {
		return this;
	}
}

// tslint:disable-next-line:ban-types
function dummyPassContext<T extends Function>(func: T): T {
	return func;
}

// ----------------------------------------------------------------------------
function dummyTraceSQLDatabaseRequest(): Sdk.DatabaseRequestTracer {
	return new DummyDatabaseRequestTracer();
}

function dummyTraceIncomingRemoteCall(): Sdk.IncomingRemoteCallTracer {
	return new DummyIncomingTracer();
}

function dummyTraceOutgoingRemoteCall(): Sdk.OutgoingRemoteCallTracer {
	return new DummyOutgoingTaggableTracer();
}

function dummyGetCurrentState(): Sdk.SDKState {
	return Sdk.SDKState.PERMANENTLY_INACTIVE;
}

function dummySetLoggingCallback(): void {
	// intentionally empty
}

// ----------------------------------------------------------------------------
export function getDummySdk(): Sdk.OneAgentSDK {
	return {
		passContext: dummyPassContext,

		traceSQLDatabaseRequest: dummyTraceSQLDatabaseRequest,

		traceIncomingRemoteCall: dummyTraceIncomingRemoteCall,

		traceOutgoingRemoteCall: dummyTraceOutgoingRemoteCall,

		getCurrentState: dummyGetCurrentState,

		setLoggingCallbacks: dummySetLoggingCallback
	};
}
