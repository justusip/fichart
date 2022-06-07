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

const scale = useSlice("scale", "1D");
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
            colour: "#ff8800",
            width: 14
        }
    },
    {
        id: uuidv4(),
        name: "Simple Moving Average",
        options: {
            colour: "#ff4400",
            width: 21
        }
    },
    {
        id: uuidv4(),
        name: "Simple Moving Average",
        options: {
            colour: "#ff0000",
            width: 30
        }
    },
    {
        id: uuidv4(),
        name: "Bollinger Bands",
        options: {
            colour: "#00ffff",
            n: 20,
            k: 2
        }
    }
]);
export const setIndicators = indicators.actions.set;

export default {
    scale: scale.reducer,
    indicators: indicators.reducer
};


