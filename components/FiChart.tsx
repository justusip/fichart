import Interval from "../misc/Interval";
import ChartCanvas from "./ChartCanvas";
import cx from "classnames";
import {useEffect, useState} from "react";
import {MdQueryStats, MdStackedLineChart} from "react-icons/md";
import VerticalSideBtn from "../components/VerticalToggle";
import IndicatorPanel from "../components/IndicatorPanel";
import {TimeScale} from "../misc/TimeScale";
import moment from "moment";

const FiChart = (props: {
    classNames?: string,
    data: Interval[],
    onTimeScaleChange?: (precision: string) => void,
    onTimeBoundsChange?: (boundLeft: number, boundRight: number) => void
}) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        setReady(true);
    }, []);

    const SECOND = 1;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;
    const timeScales: TimeScale[] = [
        {
            name: "1M",
            timeStep: MINUTE,
            gridStep: 10 * MINUTE,
            displayFormat: "DD/MM/YYYY HH:mm:ss"
        },
        {
            name: "5M",
            timeStep: 5 * MINUTE,
            gridStep: 60 * MINUTE,
            displayFormat: "DD/MM/YYYY HH:mm:ss"
        },
        {
            name: "1H",
            timeStep: HOUR,
            gridStep: 12 * HOUR,
            displayFormat: "DD/MM/YYYY HH:mm:ss"
        },
        {
            name: "1D",
            timeStep: DAY,
            gridStep: WEEK,
            displayFormat: "DD/MM/YYYY (ddd)",
            isGridStep: (time: number) => moment.unix(time).isoWeekday() == 7
        },
        {
            name: "1W",
            timeStep: WEEK,
            gridStep: MONTH,
            displayFormat: "DD/MM/YYYY (ddd)"
        }
    ];
    const [timeScale, setTimeScale] = useState(timeScales.find(o => o.name === "1D"));

    const [indiPanelToggled, setIndiPanelToggled] = useState(true);

    return ready && <div className={cx(props.classNames, "flex text-white")}>
        <div className={"bg-[#262a30] flex-1 flex flex-col"}>
            <div className={"px-4 py-2 text-xs border-b border-gray-700"}>
                <div className={"text-sm"}>NYSE/SPY</div>
                SPDR S&P 500 ETF Trust
            </div>
            <ChartCanvas className={"flex-1 h-0"}
                         data={props.data}
                         timeStep={timeScale.timeStep}
                         gridTimeStep={timeScale.gridStep}
                         valueDateFormat={timeScale.displayFormat}
                         timeScale={timeScale}
                         {...props}/>
            <div className={"bg-[#262a30] flex gap border-t border-gray-500"}>
                {
                    timeScales.map((s, i) => {
                        const disabled = i !== 3;
                        const selected = timeScale.name === s.name;
                        return <div key={i}
                                    className={cx(
                                        "text-xs py-2 px-4",
                                        {"cursor-pointer bg-gray-900": !disabled && selected},
                                        {"hover:bg-gray-700 active:bg-gray-900": !disabled && !selected},
                                        {"cursor-not-allowed text-neutral-500": disabled || selected}
                                    )}
                                    onClick={() => {
                                        if (!disabled)
                                            timeScale && setTimeScale(s);
                                    }}
                        >{s.name}</div>;
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
