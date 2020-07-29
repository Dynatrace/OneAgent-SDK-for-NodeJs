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

import * as Sdk from "../src/Sdk";


// ============================================================================
describe("Dummy End", () => {
	let dummyTracer: Sdk.DatabaseRequestTracer;

	// ========================================================================
	before(() => {
		const Api = Sdk.createInstance();
		Assert.strictEqual(typeof Api, "object");
		Assert.strictEqual(Api.getCurrentState(), Sdk.SDKState.PERMANENTLY_INACTIVE);

		dummyTracer = Api.traceSQLDatabaseRequest({} as any, {} as any);
		Assert.strictEqual(typeof dummyTracer, "object");
		Assert.strictEqual(typeof dummyTracer.startWithContext, "function");
	});

	// ========================================================================
	describe("endWithContext", () => {
		it("0 arguments", () => {
			function fn(this: string): string {
				Assert.strictEqual(this, "T");
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T");
			Assert.strictEqual(r, "rc");
		});

		it("1 argument", () => {
			function fn(this: string, _1: number): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1);
			Assert.strictEqual(r, "rc");
		});

		it("2 arguments", () => {
			function fn(this: string, _1: number, _2: string): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1, "2");
			Assert.strictEqual(r, "rc");
		});

		it("3 arguments", () => {
			function fn(this: string, _1: number, _2: string, _3: number): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1, "2", 3);
			Assert.strictEqual(r, "rc");
		});

		it("4 arguments", () => {
			function fn(this: string, _1: number, _2: string, _3: number, _4: string): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1, "2", 3, "4");
			Assert.strictEqual(r, "rc");
		});

		it("5 arguments", () => {
			function fn(this: string, _1: number, _2: string, _3: number, _4: string, _5: number): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1, "2", 3, "4", 5);
			Assert.strictEqual(r, "rc");
		});

		it("6 arguments", () => {
			function fn(this: string, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1, "2", 3, "4", 5, "6");
			Assert.strictEqual(r, "rc");
		});

		it("7 arguments", () => {
			function fn(this: string, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string, _7: number): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				Assert.strictEqual(_7, 7);
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1, "2", 3, "4", 5, "6", 7);
			Assert.strictEqual(r, "rc");
		});

		it("8 arguments", () => {
			function fn(this: string, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string, _7: number, _8: string): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				Assert.strictEqual(_7, 7);
				Assert.strictEqual(_8, "8");
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1, "2", 3, "4", 5, "6", 7, "8");
			Assert.strictEqual(r, "rc");
		});

		it("9 arguments", () => {
			function fn(this: string, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string, _7: number, _8: string, _9: number): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				Assert.strictEqual(_7, 7);
				Assert.strictEqual(_8, "8");
				Assert.strictEqual(_9, 9);
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1, "2", 3, "4", 5, "6", 7, "8", 9);
			Assert.strictEqual(r, "rc");
		});

		it("10 arguments", () => {
			function fn(this: string, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string, _7: number, _8: string, _9: number, _10: string): string {
				Assert.strictEqual(this, "T");
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				Assert.strictEqual(_7, 7);
				Assert.strictEqual(_8, "8");
				Assert.strictEqual(_9, 9);
				Assert.strictEqual(_10, "10");
				return "rc";
			}
			const r: string = dummyTracer.endWithContext(fn, "T", 1, "2", 3, "4", 5, "6", 7, "8", 9, "10");
			Assert.strictEqual(r, "rc");
		});
	});

	// ========================================================================
	describe("end", () => {
		it("0 arguments", () => {
			function fn(this: any): string {
				Assert.strictEqual(this, undefined);
				return "rc";
			}
			const r: string = dummyTracer.end(fn);
			Assert.strictEqual(r, "rc");
		});

		it("1 argument", () => {
			function fn(this: any, _1: number): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1);
			Assert.strictEqual(r, "rc");
		});

		it("2 arguments", () => {
			function fn(this: any, _1: number, _2: string): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1, "2");
			Assert.strictEqual(r, "rc");
		});

		it("3 arguments", () => {
			function fn(this: any, _1: number, _2: string, _3: number): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1, "2", 3);
			Assert.strictEqual(r, "rc");
		});

		it("4 arguments", () => {
			function fn(this: any, _1: number, _2: string, _3: number, _4: string): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1, "2", 3, "4");
			Assert.strictEqual(r, "rc");
		});

		it("5 arguments", () => {
			function fn(this: any, _1: number, _2: string, _3: number, _4: string, _5: number): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1, "2", 3, "4", 5);
			Assert.strictEqual(r, "rc");
		});

		it("6 arguments", () => {
			function fn(this: any, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1, "2", 3, "4", 5, "6");
			Assert.strictEqual(r, "rc");
		});

		it("7 arguments", () => {
			function fn(this: any, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string, _7: number): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				Assert.strictEqual(_7, 7);
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1, "2", 3, "4", 5, "6", 7);
			Assert.strictEqual(r, "rc");
		});

		it("8 arguments", () => {
			function fn(this: any, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string, _7: number, _8: string): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				Assert.strictEqual(_7, 7);
				Assert.strictEqual(_8, "8");
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1, "2", 3, "4", 5, "6", 7, "8");
			Assert.strictEqual(r, "rc");
		});

		it("9 arguments", () => {
			function fn(this: any, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string, _7: number, _8: string, _9: number): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				Assert.strictEqual(_7, 7);
				Assert.strictEqual(_8, "8");
				Assert.strictEqual(_9, 9);
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1, "2", 3, "4", 5, "6", 7, "8", 9);
			Assert.strictEqual(r, "rc");
		});

		it("10 arguments", () => {
			function fn(this: any, _1: number, _2: string, _3: number, _4: string, _5: number, _6: string, _7: number, _8: string, _9: number, _10: string): string {
				Assert.strictEqual(this, undefined);
				Assert.strictEqual(_1, 1);
				Assert.strictEqual(_2, "2");
				Assert.strictEqual(_3, 3);
				Assert.strictEqual(_4, "4");
				Assert.strictEqual(_5, 5);
				Assert.strictEqual(_6, "6");
				Assert.strictEqual(_7, 7);
				Assert.strictEqual(_8, "8");
				Assert.strictEqual(_9, 9);
				Assert.strictEqual(_10, "10");
				return "rc";
			}
			const r: string = dummyTracer.end(fn, 1, "2", 3, "4", 5, "6", 7, "8", 9, "10");
			Assert.strictEqual(r, "rc");
		});
	});
});
