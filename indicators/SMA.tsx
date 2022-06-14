import Indicator from "./Indicator";
import Interval from "../misc/Interval";
import React from "react";
import Option from "./Option";
import Context from "./Context";

export default class SMA extends Indicator {
    constructor() {
        super(
            "Simple Moving Average",
            "The unweighted mean of the previous k days",
            ["SMA"],
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
                key: "width",
                name: "Sample Width",
                type: "integer",
                initial: 7
            }
        ];
    }

    calculate(intervals: Interval[], options: any, context: Context): void {
        let width = options.width;

        let samples: number[] = [];
        let data = [];
        for (const interval of intervals) {
            samples.push(interval.c);
            if (samples.length <= width) {
                data.push({time: interval.t, price: null});
            } else {
                samples.shift();
                data.push({time: interval.t, price: samples.reduce((a, n) => a + n) / width});

            }
        }

        context.plot(data, options.colour);
    }
}
