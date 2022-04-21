import EventListener from "react-event-listener";
import {MdSearch} from "react-icons/md";
import AllIndicators from "../indicators/AllIndicators";
import {setIndicators} from "../misc/Slices";
import {useState} from "react";
import Indicator from "../indicators/Indicator";
import {useDispatch, useSelector} from "react-redux";
import Fuse from "fuse.js";

export default (props: {
    opened: boolean,
    setOpened: (opened: boolean) => void,
}) => {
    const indicators: Indicator[] = useSelector((state: any) => state.indicators.value);
    const dispatch = useDispatch();
    const [query, setQuery] = useState("");

    const fuse = new Fuse(AllIndicators, {
        keys: ["name", "desc", "tags"]
    });

    return <div
        className={"absolute inset-0 flex place-items-center place-content-center bg-black/50"}
        onClick={() => props.setOpened(false)}
    >
        <EventListener target={"document"}
                       onKeyDown={e => {
                           if (e.key == "Escape")
                               props.setOpened(false);
                       }}/>
        <div className={"w-[400px] h-[300px] bg-[#262a30] rounded shadow"}
             onClick={e => e.stopPropagation()}>
            <div className={"flex place-items-center border-b border-gray-700"}>
                <MdSearch className={"m-2"}/>
                <input className={"bg-transparent flex-1 focus:outline-0 text-sm"}
                       value={query}
                       onChange={e => setQuery(e.target.value)}
                       autoFocus={true}
                       placeholder={"Search indicator..."}
                />
            </div>
            {
                (query === "" ? AllIndicators : fuse.search(query).map(o => o.item))
                    .map((indi, i) =>
                        <div key={i}
                             className={"p-2 hover:bg-white/5 active:bg-black/30 cursor-pointer"}
                             onClick={() => {
                                 dispatch(setIndicators([...indicators, indi.generateData()]));
                                 props.setOpened(false);
                             }}>
                            <div className={"text-sm"}>{indi.name}</div>
                            <div className={"text-xs text-neutral-400"}>{indi.desc}</div>
                        </div>
                    )
            }

        </div>
    </div>;
};
