import {NextPage} from "next";
import React, {useEffect} from "react";
import FiChart from "../components/FiChart";
import Data from "../misc/Data";
import moment from "moment";
import Interval from "../misc/Interval";

const Home: NextPage = () => {

    const [data, setData] = React.useState<Interval[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [loadedLeft, setLoadedLeft] = React.useState<number | null>(null);
    const prefetchSteps = 200; // When reached out of bound, fetch [x] amount of bars outside bound

    const mergeIntervals = (a: Interval[], b: Interval[]) => {
        return [...a, ...b]
            .filter((item, pos, items) => items.findIndex(o => o.t === item.t) === pos)
            .sort((a, b) => a.t - b.t);
    };

    const load = async (to: moment.Moment) => {
        setLoading(true);
        const from = to.clone().subtract(prefetchSteps, "day");
        const res = await fetch("/api/bars?" + new URLSearchParams({
            from: from.format("YYYY-MM-DD"),
            to: to.format("YYYY-MM-DD")
        }));
        const js = await res.json();
        setData(mergeIntervals(data, js));
        console.log(mergeIntervals(data, js));
        setLoadedLeft(from.unix());
        console.log(`Loaded from ${from.format("YYYY-MM-DD")} to ${to.format("YYYY-MM-DD")}`);
        setLoading(false);
    };

    useEffect(() => {
        load(moment().startOf("day").subtract(1, "day"));
    }, []);

    return <div className={"w-full h-screen"}>
        <FiChart classNames={"w-full h-full"}
                 data={data}
                 onTimeBoundsChange={(boundLeft: number, boundRight: number) => {
                     if (!loading && boundLeft < loadedLeft) {
                         load(moment.unix(loadedLeft));
                     }
                 }}
        />
    </div>;
};

export default Home;
