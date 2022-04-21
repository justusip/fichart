import {createSlice} from "@reduxjs/toolkit";
import {v4 as uuidv4} from "uuid";
import IndicatorData from "../indicators/IndicatorData";

const useSlice = <T>(name: string, initialVal: T) =>
    createSlice({
        name,
        initialState: {
            value: initialVal,
        },
        reducers: {
            set: (state, action) => {
                state.value = action.payload;
            },
        },
    });

const scale = useSlice("scale", "1M");
export const setScale = scale.actions.set;

const indicators = useSlice<IndicatorData[]>("indicators", [
    {
        id: uuidv4(),
        name: "Simple Moving Average",
        options: {
            colour: "#ffff00",
            width: 7
        }
    },
    {
        id: uuidv4(),
        name: "Simple Moving Average",
        options: {
            colour: "#ffff00",
            width: 14
        }
    }

]);
export const setIndicators = indicators.actions.set;

export default {
    scale: scale.reducer,
    indicators: indicators.reducer
};


