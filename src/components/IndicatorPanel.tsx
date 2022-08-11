import {MdAdd} from "react-icons/md";
import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {setIndicators} from "../misc/Slices";
import {DropResult} from "react-beautiful-dnd";
import {_DragDropContext, _Droppable} from "./ImportNoSSR";
import IndicatorAdd from "./IndicatorAdd";
import IndicatorData from "../indicators/AddedIndicator";
import IndicatorPanelItem from "./IndicatorPanelItem";

export default (props: {}) => {
    const indiData: IndicatorData[] = useSelector((state: any) => state.indicators.value);
    const dispatch = useDispatch();

    const [addDialogOpened, setAddDialogOpened] = useState(false);

    const reorder = <T extends unknown>(list: T[], startIndex: number, endIndex: number): T[] => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination)
            return;

        const orderedArr = reorder(
            indiData,
            result.source.index,
            result.destination.index
        );

        dispatch(setIndicators(orderedArr));
    };

    return <>
        {addDialogOpened && <IndicatorAdd opened={addDialogOpened} setOpened={setAddDialogOpened}/>}
        <div className={"w-[250px] bg-[#262a30] text-xs border-l border-gray-700 flex flex-col"}>
            <div className={"p-2 border-b border-gray-700"}>Indicators</div>
            <_DragDropContext onDragEnd={onDragEnd}>
                <_Droppable droppableId="droppable">
                    {
                        (provided, snapshot) =>
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}>
                                {
                                    indiData.map((indi, i) =>
                                        <IndicatorPanelItem key={indi.id} index={i} indiData={indi}/>
                                    )
                                }
                                {provided.placeholder}
                            </div>
                    }
                </_Droppable>
            </_DragDropContext>

            <div className={"border-t border-gray-700 mt-auto flex"}>
                <button
                    className={"p-2 ml-auto text-sm hover:bg-white/5 active:bg-black/30"}
                    onClick={() => setAddDialogOpened(true)}>
                    <MdAdd/>
                </button>
            </div>
        </div>
    </>;
}
