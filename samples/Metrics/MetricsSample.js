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

"use strict";

// tslint:disable:no-console

// ----------------------------------------------------------------------------
const Sdk = require("@dynatrace/oneagent-sdk");
const Api = Sdk.createInstance();

// ----------------------------------------------------------------------------
if (Api.getCurrentState() !== Sdk.SDKState.ACTIVE) {
  console.error("MetricsSample: SDK is not active!");
}

// install logging callbacks
Api.setLoggingCallbacks({
  warning: (msg) => console.error("MetricsSample SDK warning: " + msg),
  error: (msg) => console.error("MetricsSample SDK error: " + msg)
});

// ----------------------------------------------------------------------------

// create some metrics
const intCounter = Api.createIntegerCounterMetric("aIntCounter");
const floatGauge = Api.createFloatGaugeMetric("aFloatGauge", { dimensionName: "aDimName"} );
const intStatistics = Api.createIntegerStatisticsMetric("aIntStat", { unit: "aUnit"} );

// report some values
setInterval(() => {
  intCounter.increaseBy(10 * Math.random());
  floatGauge.setValue(10 * Math.random(), "firstDim");
  floatGauge.setValue(10 * Math.random(), "secondDim");
  intStatistics.addValue(10 * Math.random());
}, 800);
