import BB from "./BB";
import Indicator from "./Indicator";
import SMA from "./SMA";
// import RSI from "./RSI";

const AllIndicators: Indicator[] = [
    new SMA(),
    new BB()
];

export default AllIndicators;
