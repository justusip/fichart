import Interval from "../misc/Interval";
import ChartCanvas from "./ChartCanvas";
import cx from "classnames";
import {useEffect, useState} from "react";
import {MdQueryStats, MdStackedLineChart} from "react-icons/md";
import VerticalSideBtn from "../components/VerticalToggle";
import IndicatorPanel from "../components/IndicatorPanel";
import DefinedIntervals from "../misc/DefinedIntervals";

const FiChart = (props: {
    classNames?: string,
    data: Interval[],
    timeScales?: string[],
    onTimeScaleChange?: (precision: string) => void
}) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        setReady(true);
    }, []);

    const timeScales = props.timeScales || ["1M", "5M", "1H", "1D", "1W"];
    const [timeScale, setTimeScale] = useState("1D");
    const timeStep = DefinedIntervals[timeScale];

    const timesPerGrid: { [key: string]: number } = {
        "1M": 60 * 60,
        "5M": 60 * 60,
        "1H": 24 * 60 * 60,
        "4H": 24 * 60 * 60,
        "1D": 7 * 24 * 60 * 60,
        "1W": 30 * 24 * 60 * 60,
    };
    const timePerGrid: number = timesPerGrid[timeScale];
    const valueDateFormats: { [key: string]: string } = {
        "1M": "DD/MM/YYYY HH:mm:ss",
        "5M": "DD/MM/YYYY HH:mm:ss",
        "1H": "DD/MM/YYYY HH:mm:ss",
        "4H": "DD/MM/YYYY HH:mm:ss",
        "1D": "DD/MM/YYYY",
        "1W": "DD/MM/YYYY",
    };
    const valueDateFormat: string = valueDateFormats[timeScale];

    const [indiPanelToggled, setIndiPanelToggled] = useState(true);

    return ready && <div className={cx(props.classNames, "flex text-white")}>
        <div className={"bg-[#262a30] flex-1 flex flex-col"}>
            <div className={"px-4 py-2 text-xs border-b border-gray-700"}>
                FiChart Demo
            </div>
            <ChartCanvas className={"flex-1 h-0"}
                         data={props.data}
                         timeStep={timeStep}
                         timePerGrid={timePerGrid}
                         valueDateFormat={valueDateFormat}/>
            <div className={"bg-[#262a30] flex gap border-t border-gray-500"}>
                {
                    timeScales.map((p, i) => {
                        const disabled = p !== timeScales[0];
                        return <div key={i}
                                    className={cx(
                                        "text-xs py-2 px-4",
                                        {"cursor-pointer bg-gray-900": !disabled && timeScale === p},
                                        {"hover:bg-gray-700 active:bg-gray-900": !disabled && timeScale !== p},
                                        {"cursor-not-allowed text-neutral-500": disabled}
                                    )}
                                    onClick={() => {
                                        if (!disabled)
                                            timeScale && setTimeScale(p);
                                    }}
                        >{p}</div>;
                    })
                }
                {
                    <div className={"ml-auto text-xs py-2 px-4"}>EST (UTC-5)</div>
                }
            </div>
        </div>
        {indiPanelToggled && <IndicatorPanel/>}
        <div className={"bg-[#262a30] text-xs border-l border-gray-700"}>
            <VerticalSideBtn
                isToggled={indiPanelToggled}
                onToggle={() => setIndiPanelToggled(!indiPanelToggled)}
                icon={<MdStackedLineChart/>}>
                Indicators
            </VerticalSideBtn>
            <VerticalSideBtn
                isToggled={false}
                onToggle={() => 1}
                icon={<MdQueryStats/>}
                disabled>
                BackTesting
            </VerticalSideBtn>
        </div>
    </div>;
};

export default FiChart;
