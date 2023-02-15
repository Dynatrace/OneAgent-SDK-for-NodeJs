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

import * as Sdk from "./Sdk";

// ============================================================================

const useNewBufferApi =  typeof(Buffer.alloc) === "function";

function BufferFrom(str: string, encoding?: BufferEncoding): Buffer {
	// tslint:disable-next-line:deprecation
	return useNewBufferApi ? Buffer.from(str, encoding) : new Buffer(str, encoding);
}

class DummyTracer implements Sdk.Tracer {
	public start<R>(handler: (...args: any[]) => R, ...args: any[]): R {
		if (typeof handler !== "function") {
			throw new TypeError(`OneAgent SDK: Tracer.start() first parameter must be a function, but received ${typeof(handler)}`);
		}
		return handler.call(undefined, ...args);
	}

	public startWithContext<R>(handler: (...args: any[]) => R, thisObj?: any, ...args: any[]): R {
		if (typeof handler !== "function") {
			throw new TypeError(`OneAgent SDK: Tracer.start() first parameter must be a function, but received ${typeof(handler)}`);
		}
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
		if (handler !== undefined) {
			if (typeof handler !== "function") {
				throw new TypeError(`OneAgent SDK: Tracer.end() first parameter must be a function, but received ${typeof(handler)}`);
			}
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
		return BufferFrom("");
	}
}

class DummyDatabaseRequestTracer extends DummyOutgoingTracer implements Sdk.DatabaseRequestTracer {
	public setResultData(): this {
		return this;
	}
}

class DummyOutgoingMessageTracer extends DummyOutgoingTaggableTracer implements Sdk.OutgoingMessageTracer {
	public setVendorMessageId(): this {
		return this;
	}

	public setCorrelationId(): this {
		return this;
	}
}

class DummyIncomingMessageTracer extends DummyIncomingTracer implements Sdk.IncomingMessageTracer {
	public setVendorMessageId(): this {
		return this;
	}

	public setCorrelationId(): this {
		return this;
	}
}


// ----------------------------------------------------------------------------
class DummyCounter implements Sdk.CounterMetricDimensionLess, Sdk.CounterMetricWithDimension {
	public increaseBy(): void {
		// empty
	}
}

class DummyGauge implements Sdk.GaugeMetricDimensionLess, Sdk.GaugeMetricWithDimension {
	public setValue(): void {
		// empty
	}
}

class DummyStatistics implements Sdk.StatisticsMetricDimensionLess, Sdk.StatisticsMetricWithDimension {
	public addValue(): void {
		// empty
	}
}

// ----------------------------------------------------------------------------
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

function dummyTraceOutgoingMessage(): Sdk.OutgoingMessageTracer {
	return new DummyOutgoingMessageTracer();
}

function dummyTraceIncomingMessage(): Sdk.IncomingMessageTracer {
	return new DummyIncomingMessageTracer();
}

function dummyAddCustomRequestAttribute(): void {
	// intentionally empty
}

// ----------------------------------------------------------------------------
function dummyCreateIntegerCounterMetric(): Sdk.CounterMetricDimensionLess {
	return new DummyCounter();
}

function dummyCreateFloatCounterMetric(): Sdk.CounterMetricDimensionLess {
	return new DummyCounter();
}

function dummyCreateIntegerGaugeMetric(): Sdk.GaugeMetricDimensionLess {
	return new DummyGauge();
}

function dummyCreateFloatGaugeMetric(): Sdk.GaugeMetricDimensionLess {
	return new DummyGauge();
}

function dummyCreateIntegerStatisticsMetric(): Sdk.StatisticsMetricDimensionLess {
	return new DummyStatistics();
}

function dummyCreateFloatStatisticsMetric(): Sdk.StatisticsMetricDimensionLess {
	return new DummyStatistics();
}


// ----------------------------------------------------------------------------
function dummyGetCurrentState(): Sdk.SDKState {
	return Sdk.SDKState.PERMANENTLY_INACTIVE;
}

function dummySetLoggingCallback(): void {
	// intentionally empty
}

function dummyTraceContext(): Sdk.TraceContextInfo {
	return {
		isValid: false,
		traceid: Sdk.invalidTraceId,
		spanid: Sdk.invalidSpanId
	};
}

// ============================================================================
export function getDummySdk(): Sdk.OneAgentSDK {
	return {
		passContext: dummyPassContext,

		traceSQLDatabaseRequest: dummyTraceSQLDatabaseRequest,

		traceIncomingRemoteCall: dummyTraceIncomingRemoteCall,

		traceOutgoingRemoteCall: dummyTraceOutgoingRemoteCall,

		traceOutgoingMessage: dummyTraceOutgoingMessage,

		traceIncomingMessage: dummyTraceIncomingMessage,

		addCustomRequestAttribute: dummyAddCustomRequestAttribute,

		createIntegerCounterMetric: dummyCreateIntegerCounterMetric,
		createFloatCounterMetric: dummyCreateFloatCounterMetric,
		createIntegerGaugeMetric: dummyCreateIntegerGaugeMetric,
		createFloatGaugeMetric: dummyCreateFloatGaugeMetric,
		createIntegerStatisticsMetric: dummyCreateIntegerStatisticsMetric,
		createFloatStatisticsMetric: dummyCreateFloatStatisticsMetric,

		getCurrentState: dummyGetCurrentState,

		setLoggingCallbacks: dummySetLoggingCallback,
		getTraceContextInfo: dummyTraceContext
	};
}
