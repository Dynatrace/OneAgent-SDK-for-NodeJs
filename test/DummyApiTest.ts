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

import * as Assert from "assert";
import * as Sinon from "sinon";

import * as Sdk from "../src/Sdk";


// ============================================================================
describe("Dummy", () => {
	let Api: Sdk.OneAgentSDK;

	// ------------------------------------------------------------------------
	function assertStart(tracer: Sdk.Tracer): void {
		const handlerStub = Sinon.stub();
		const expRc = {};
		handlerStub.returns(expRc);
		const thisArg = {};
		const argObj = {};

		let rc = tracer.startWithContext(handlerStub, thisArg, 1, "2", argObj);
		Sinon.assert.callCount(handlerStub, 1);
		Sinon.assert.calledWithExactly(handlerStub, 1, "2", argObj);
		Sinon.assert.calledOn(handlerStub, thisArg);
		Assert.strictEqual(rc, expRc);
		handlerStub.resetHistory();

		rc = tracer.start(handlerStub, "3", argObj, 5);
		Sinon.assert.callCount(handlerStub, 1);
		Sinon.assert.calledWithExactly(handlerStub, "3", argObj, 5);
		Sinon.assert.calledOn(handlerStub, undefined);
		Assert.strictEqual(rc, expRc);
		handlerStub.resetHistory();

		Assert.throws(() => tracer.startWithContext({} as any, "this"), "TypeError: OneAgent SDK: Tracer.start() first parameter must be a function, but received object");
		Assert.throws(() => (tracer as any).startWithContext(), "TypeError: OneAgent SDK: Tracer.start() first parameter must be a function, but received undefined");
		Assert.throws(() => tracer.start(15 as any), "TypeError: OneAgent SDK: Tracer.start() first parameter must be a function, but received number");
		Assert.throws(() => (tracer as any).start(), "TypeError: OneAgent SDK: Tracer.start() first parameter must be a function, but received undefined");

		const expError = new RangeError("TestError");
		handlerStub.throws(expError);
		Assert.throws(() => tracer.startWithContext(handlerStub, thisArg), expError);
		Sinon.assert.callCount(handlerStub, 1);
		Sinon.assert.calledOn(handlerStub, thisArg);
		handlerStub.resetHistory();

		Assert.throws(() => tracer.start(handlerStub), expError);
		Sinon.assert.callCount(handlerStub, 1);
		Sinon.assert.calledOn(handlerStub, undefined);
		handlerStub.resetHistory();
	}

	// ------------------------------------------------------------------------
	function assertTaggableOutgoing(tracer: Sdk.OutgoingTaggable): void {
		const byteTag = tracer.getDynatraceByteTag();
		Assert.ok(Buffer.isBuffer(byteTag));
		Assert.strictEqual(byteTag.length, 0);

		const stringTag = tracer.getDynatraceStringTag();
		Assert.strictEqual(stringTag, "");
	}

	// ------------------------------------------------------------------------
	function assertOutgoingEnd(tracer: Sdk.OutgoingTracer): void {
		const handlerStub = Sinon.stub();
		const expRc = {};
		handlerStub.returns(expRc);
		const thisArg = {};
		const argObj = {};

		let rc = tracer.endWithContext(handlerStub, thisArg, 1, "2", argObj);
		Sinon.assert.callCount(handlerStub, 1);
		Sinon.assert.calledWithExactly(handlerStub, 1, "2", argObj);
		Sinon.assert.calledOn(handlerStub, thisArg);
		Assert.strictEqual(rc, expRc);
		tracer.end();
		handlerStub.resetHistory();

		rc = tracer.end(handlerStub, "3", argObj, 5);
		Sinon.assert.callCount(handlerStub, 1);
		Sinon.assert.calledWithExactly(handlerStub, "3", argObj, 5);
		Sinon.assert.calledOn(handlerStub, undefined);
		Assert.strictEqual(rc, expRc);
		handlerStub.resetHistory();

		Assert.throws(() => tracer.endWithContext({} as any, "this"), "TypeError: OneAgent SDK: Tracer.end() first parameter must be a function, but received object");
		Assert.throws(() => tracer.end(15 as any), "TypeError: OneAgent SDK: Tracer.end() first parameter must be a function, but received number");

		const expError = new RangeError("TestError");
		handlerStub.throws(expError);
		Assert.throws(() => tracer.endWithContext(handlerStub, thisArg), expError);
		Sinon.assert.callCount(handlerStub, 1);
		Sinon.assert.calledOn(handlerStub, thisArg);
		handlerStub.resetHistory();

		Assert.throws(() => tracer.end(handlerStub), expError);
		Sinon.assert.callCount(handlerStub, 1);
		Sinon.assert.calledOn(handlerStub, undefined);
		handlerStub.resetHistory();
	}

	// ========================================================================
	before(() => {
		Api = Sdk.createInstance();
		Assert.strictEqual(typeof Api, "object");
		Assert.strictEqual(Api.getCurrentState(), Sdk.SDKState.PERMANENTLY_INACTIVE);
	});

	// ========================================================================
	it("Api count", () => {
		// verify the number of exported APIs. Mainly to get a hint to add tests...
		const apis = Object.getOwnPropertyNames(Api);
		Assert.strictEqual(apis.length, 16);
	});

	// ========================================================================
	it("PassContext", () => {
		function cb() { /* empty */	}
		const rc = Api.passContext(cb);
		Assert.strictEqual(rc, cb);
	});

	// ========================================================================
	it("SqlDatabaseRequest", () => {
		const tracer = Api.traceSQLDatabaseRequest({} as Sdk.DatabaseInfo, {} as Sdk.SQLDatabaseRequestStartData);
		assertStart(tracer);
		let rc = tracer.error(new Error("test"));
		Assert.strictEqual(rc, tracer);
		rc = tracer.setResultData({});
		Assert.strictEqual(rc, tracer);
		assertOutgoingEnd(tracer);
	});

	// ========================================================================
	it("OutgoingRemoteCall", () => {
		const tracer = Api.traceOutgoingRemoteCall({} as Sdk.OutgoingRemoteCallStartData);
		assertStart(tracer);
		assertTaggableOutgoing(tracer);
		const rc = tracer.error(new Error("test"));
		Assert.strictEqual(rc, tracer);
		assertOutgoingEnd(tracer);
	});

	// ========================================================================
	it("IncomingRemoteCall", () => {
		const tracer = Api.traceIncomingRemoteCall({} as Sdk.IncomingRemoteCallStartData);
		assertStart(tracer);
		const rc = tracer.error(new Error("test"));
		Assert.strictEqual(rc, tracer);
		tracer.end();
	});

	// ========================================================================
	it("OutgoingMessageing", () => {
		const tracer = Api.traceOutgoingMessage({} as Sdk.OutgoingMessageStartData);
		assertStart(tracer);
		assertTaggableOutgoing(tracer);
		let rc = tracer.setVendorMessageId("");
		Assert.strictEqual(rc, tracer);
		rc = tracer.setCorrelationId("");
		Assert.strictEqual(rc, tracer);
		rc = tracer.error(new Error("test"));
		Assert.strictEqual(rc, tracer);
		assertOutgoingEnd(tracer);
	});

	// ========================================================================
	it("IncomingMessage", () => {
		const tracer = Api.traceIncomingMessage({} as Sdk.IncomingMessageStartData);
		assertStart(tracer);
		let rc = tracer.setVendorMessageId("");
		Assert.strictEqual(rc, tracer);
		rc = tracer.setCorrelationId("");
		Assert.strictEqual(rc, tracer);
		rc = tracer.error(new Error("test"));
		Assert.strictEqual(rc, tracer);
		tracer.end();
	});

	// ========================================================================
	it("addCustomRequestAttribute", () => {
		Api.addCustomRequestAttribute("key", "value");
	});

	// ========================================================================
	describe("Metrics", () => {
		it("createIntegerCounterMetric", () => {
			const metric = Api.createIntegerCounterMetric("key");
			Assert.strictEqual(typeof(metric), "object");
			metric.increaseBy(10);
		});

		it("createFloatCounterMetric", () => {
			const metric = Api.createFloatCounterMetric("key");
			Assert.strictEqual(typeof(metric), "object");
			metric.increaseBy(10);
		});

		it("createIntegerGaugeMetric", () => {
			const metric = Api.createIntegerGaugeMetric("key");
			Assert.strictEqual(typeof(metric), "object");
			metric.setValue(10);
		});

		it("createFloatGaugeMetric", () => {
			const metric = Api.createFloatGaugeMetric("key");
			Assert.strictEqual(typeof(metric), "object");
			metric.setValue(10);
		});

		it("createIntegerStatisticsMetric", () => {
			const metric = Api.createIntegerStatisticsMetric("key");
			Assert.strictEqual(typeof(metric), "object");
			metric.addValue(10);
		});

		it("createFloatStatisticsMetric", () => {
			const metric = Api.createFloatStatisticsMetric("key");
			Assert.strictEqual(typeof(metric), "object");
			metric.addValue(10);
		});
	});

	// ========================================================================
	it("setLoggingCallbacks", () => {
		const cb = () => { /* empty */ };
		Api.setLoggingCallbacks({ warning: cb, error: cb });
		Api.setLoggingCallbacks({ warning: cb });
		Api.setLoggingCallbacks({ error: cb });
		Api.setLoggingCallbacks({});
		Api.setLoggingCallbacks();
	});

	// ========================================================================
	it("traceContext", () => {
		Assert.strictEqual(Api.getTraceContextInfo().isValid, false);
		Assert.strictEqual(Api.getTraceContextInfo().traceid, Sdk.invalidTraceId);
		Assert.strictEqual(Api.getTraceContextInfo().spanid, Sdk.invalidSpanId);
	});
});
