import {NextPage} from "next";
import FiChart from "../components/FiChart";
import Data from "../misc/Data";
import Interval from "../misc/Interval";

const Home: NextPage = () => {

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
    return <div className={"w-full h-screen"}>
        <FiChart classNames={"w-full h-full"}
                 data={data}
        />
    </div>;
};

export default Home;
