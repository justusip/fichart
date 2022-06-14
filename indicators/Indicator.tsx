import {v4 as uuidv4} from "uuid";

import Interval from "../misc/Interval";
import Option from "./Option";
import React from "react";
import IndicatorData from "./AddedIndicator";
import Context from "./Context";

export default abstract class Indicator {

    name: string;
    desc: string;
    tags: string[];

    protected constructor(name: string, desc: string, tags: string[]) {
        this.name = name;
        this.desc = desc;
        this.tags = tags;
    }

    abstract calculate(intervals: Interval[], options: any, context: Context): void;

    abstract options(): Option[]

    generateData(): IndicatorData {
        return {
            name: this.name,
            id: uuidv4(),
            options: Object.fromEntries(
                this.options().map(opt => [opt.key, opt.initial])
            )
        };
    }

}

