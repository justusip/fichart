import Indicator from "./Indicator";
import Interval from "../misc/Interval";
import React from "react";
import Option from "./Option";
import Context from "./Context";

export default class BB extends Indicator {
    constructor() {
        super(
            "Bollinger Bands",
            "Characterizing the prices and volatility over time",
            ["BB"],
        );
    }

    options(): Option[] {
        return [
            {
                key: "colour",
                name: "Line Colour",
                type: "colour",
                initial: "#ffff00"
            },
            {
                key: "n",
                name: "N",
                type: "integer",
                initial: 20
            },
            {
                key: "k",
                name: "K",
                type: "integer",
                initial: 2
            }
        ];
    }

    calculate(intervals: Interval[], options: any, context: Context): void {
        let n = options.n;
        let k = options.k;

        let samples: number[] = [];
        let mb = [];
        let ub = [];
        let lb = [];
        for (const interval of intervals) {
            samples.push(interval.close);
            if (samples.length <= n) {
                mb.push({time: interval.timestamp, price: null});
                ub.push({time: interval.timestamp, price: null});
                lb.push({time: interval.timestamp, price: null});
            } else {
                samples.shift();
                const average = samples.reduce((a, n) => a + n) / n;
                const deviations = samples.map(n => (n - average) ^ 2);
                const variance = deviations.reduce((a, n) => a + n) / n;
                const sd = Math.sqrt(variance);
                mb.push({time: interval.timestamp, price: average});
                ub.push({time: interval.timestamp, price: average + k * sd});
                lb.push({time: interval.timestamp, price: average - k * sd});
            }
        }

        context.plot(mb, options.colour);
        context.plot(ub, options.colour);
        context.plot(lb, options.colour);
    }
}
