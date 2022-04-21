import {NextPage} from "next";
import Interval from "../misc/Interval";
import Chart from "../components/Chart";
import Data from "../misc/Data";
import classNames from "classnames";
import {useEffect, useState} from "react";
import {MdAreaChart, MdCloud, MdQueryStats, MdStackedLineChart} from "react-icons/md";
import VerticalToggle from "../components/VerticalToggle";
import {useDispatch, useSelector} from "react-redux";
import {setScale} from "../misc/Slices";
import IndicatorPanel from "../components/IndicatorPanel";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";

const Home: NextPage = () => {

    const scale = useSelector((state: any) => state.scale);
    const dispatch = useDispatch();

    const [ready, setReady] = useState(false);
    useEffect(() => {
        setReady(true);
    }, []);

    const data = Data.map<Interval>((o: any) => {
        return {
            time: o["time"],
            open: o["open"],
            high: o["high"],
            low: o["low"],
            close: o["close"],
            volume: o["volume"],
            indicators: {}
        };
    });

    const precisions = ["1M", "5M", "1H", "1D", "1W"];
    const [precision, setPrecision] = useState(precisions[0]);

    const [indiPanelToggled, setIndiPanelToggled] = useState(true);

    return ready && <div className={"w-full h-screen flex text-white"}>
        <div className={"bg-[#262a30] flex-1 flex flex-col"}>
            <div className={"px-4 py-2 text-xs border-b border-gray-700"}>
                BTC/USDT
            </div>
            <Chart className={"flex-1 h-0"}
                   data={data}/>
            <div className={"bg-[#262a30] flex gap border-t border-gray-500"}>
                {
                    precisions.map((p, i) =>
                        <div key={i}
                             className={classNames(
                                 "text-xs py-2 px-4 cursor-pointer",
                                 {"bg-gray-900": scale === p},
                                 {"hover:bg-gray-700 active:bg-gray-900": scale !== p},
                             )}
                             onClick={() => dispatch(setScale(p))}
                        >{p}</div>)
                }
            </div>
        </div>
        {indiPanelToggled && <IndicatorPanel/>}
        {/*indicators={indicators}*/}
        <div className={"bg-[#262a30] text-xs border-l border-gray-700"}>
            <VerticalToggle
                isToggled={indiPanelToggled}
                onToggle={() => setIndiPanelToggled(!indiPanelToggled)}
                icon={<MdStackedLineChart/>}>
                Indicator
            </VerticalToggle>
            <VerticalToggle
                isToggled={false}
                onToggle={() => 1}
                icon={<MdQueryStats/>}>
                IntelliBrains
            </VerticalToggle>
        </div>
    </div>;
};

export default Home;
