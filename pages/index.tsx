import {NextPage} from "next";
import React from "react";
import FiChart from "../components/FiChart";
import Data from "../misc/Data";

const Home: NextPage = () => {

    const [data, setData] = React.useState(Data);
    return <div className={"w-full h-screen"}>
        <FiChart classNames={"w-full h-full"} data={data}/>
    </div>;
};

export default Home;
