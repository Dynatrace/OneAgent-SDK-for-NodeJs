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
		Assert.strictEqual(apis.length, 6);
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
		const rc = tracer.error(new Error("test"));
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
	it("setLoggingCallbacks", () => {
		const cb = () => { /* empty */ };
		Api.setLoggingCallbacks({ warning: cb, error: cb });
		Api.setLoggingCallbacks({ warning: cb });
		Api.setLoggingCallbacks({ error: cb });
		Api.setLoggingCallbacks({});
		Api.setLoggingCallbacks();
	});
});
