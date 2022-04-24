import Interval from "../misc/Interval";
import Chart from "../components/Chart";
import cx from "classnames";
import {useEffect, useState} from "react";
import {MdQueryStats, MdStackedLineChart} from "react-icons/md";
import VerticalToggle from "../components/VerticalToggle";
import IndicatorPanel from "../components/IndicatorPanel";

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
    const [timeScale, setTimeScale] = useState(timeScales[0]);

    const [indiPanelToggled, setIndiPanelToggled] = useState(true);

    return ready && <div className={cx(props.classNames, "flex text-white")}>
        <div className={"bg-[#262a30] flex-1 flex flex-col"}>
            <div className={"px-4 py-2 text-xs border-b border-gray-700"}>
                FiChart Demo
            </div>
            <Chart className={"flex-1 h-0"}
                   data={props.data}/>
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
            </div>
        </div>
        {indiPanelToggled && <IndicatorPanel/>}
        <div className={"bg-[#262a30] text-xs border-l border-gray-700"}>
            <VerticalToggle
                isToggled={indiPanelToggled}
                onToggle={() => setIndiPanelToggled(!indiPanelToggled)}
                icon={<MdStackedLineChart/>}>
                Indicators
            </VerticalToggle>
            <VerticalToggle
                isToggled={false}
                onToggle={() => 1}
                icon={<MdQueryStats/>}
                disabled>
                BackTesting
            </VerticalToggle>
        </div>
    </div>;
};

export default FiChart;
