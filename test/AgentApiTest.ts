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
describe("Sdk with agent", () => {
	let getSdkStub: Sinon.SinonStub;

	beforeEach(() => {
		Assert.strictEqual((global as any).__DT_GETAGENTAPI__, undefined);
		getSdkStub = Sinon.stub();
		(global as any).__DT_GETAGENTAPI__ = getSdkStub;
	});

	afterEach(() => {
		delete (global as any).__DT_GETAGENTAPI__;
	});

	// ------------------------------------------------------------------------
	it("agent returns undefined", () => {
		getSdkStub.returns(undefined);

		// if agent returns undefined a dummy SDK is returned
		const sdkApi = Sdk.createInstance();
		Assert.strictEqual(typeof sdkApi, "object");
		Sinon.assert.callCount(getSdkStub, 1);
		Sinon.assert.alwaysCalledWith(getSdkStub, 9);
		Assert.strictEqual(sdkApi.getCurrentState(), Sdk.SDKState.PERMANENTLY_INACTIVE);
	});

	// ------------------------------------------------------------------------
	it("agent returns SDK", () => {
		const agentSdk = {
			getCurrentState() {
				return Sdk.SDKState.ACTIVE;
			}
		};
		getSdkStub.returns(agentSdk);

		const sdkApi = Sdk.createInstance();
		Assert.strictEqual(sdkApi, agentSdk);
		Sinon.assert.callCount(getSdkStub, 1);
		Sinon.assert.alwaysCalledWith(getSdkStub, 9);
		Assert.strictEqual(sdkApi.getCurrentState(), Sdk.SDKState.ACTIVE);
	});

	// ------------------------------------------------------------------------
	describe("enum/constants presence", () => {
		const SdkAsAny: any = Sdk;

		it("channelType", () => {
			Assert.strictEqual(typeof SdkAsAny.ChannelType, "object");
			Assert.strictEqual(typeof Sdk.ChannelType.IN_PROCESS, "number");
			Assert.strictEqual(Sdk.ChannelType.IN_PROCESS, 4);
		});

		it("SDKState", () => {
			Assert.strictEqual(typeof SdkAsAny.SDKState, "object");
			Assert.strictEqual(typeof Sdk.SDKState.ACTIVE, "number");
			Assert.strictEqual(Sdk.SDKState.PERMANENTLY_INACTIVE, 2);
		});

		it("DatabaseVendor", () => {
			Assert.strictEqual(typeof SdkAsAny.DatabaseVendor, "object");
			Assert.strictEqual(typeof Sdk.DatabaseVendor.APACHE_HIVE, "string");
			Assert.strictEqual(Sdk.DatabaseVendor.REDSHIFT, "Amazon Redshift");
		});

		it("MessageSystemVendor", () => {
			Assert.strictEqual(typeof SdkAsAny.MessageSystemVendor, "object");
			Assert.strictEqual(typeof Sdk.MessageSystemVendor.KAFKA, "string");
			Assert.strictEqual(Sdk.MessageSystemVendor.HORNETQ, "HornetQ");
		});

		it("MessageDestinationType", () => {
			Assert.strictEqual(typeof SdkAsAny.MessageDestinationType, "object");
			Assert.strictEqual(typeof Sdk.MessageDestinationType.QUEUE, "number");
			Assert.strictEqual(Sdk.MessageDestinationType.TOPIC, 1);
		});

		it("TraceContext", () => {
			Assert.strictEqual(Sdk.invalidSpanId, "0000000000000000");
			Assert.strictEqual(Sdk.invalidTraceId, "00000000000000000000000000000000");

			Assert.strictEqual(typeof Sdk.invalidSpanId, "string");
			Assert.strictEqual(typeof Sdk.invalidTraceId, "string");
		});
	});
});
