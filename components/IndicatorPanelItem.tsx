import {MdOutlineClose, MdOutlineMenu} from "react-icons/md";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {setIndicators} from "../misc/Slices";
import {Draggable} from "react-beautiful-dnd";
import classNames from "classnames";
import ColourField from "./fields/ColourField";
import IntergerField from "./fields/IntergerField";
import IndicatorData from "../indicators/IndicatorData";
import allIndicators from "../indicators/AllIndicators";

export default (props: { index: number, indiData: IndicatorData }) => {
    const indicators: IndicatorData[] = useSelector((state: any) => state.indicators.value);
    const dispatch = useDispatch();

    const indi = allIndicators.find(indi => indi.name === props.indiData.name);

    return <Draggable key={props.indiData.id}
                      draggableId={props.indiData.id}
                      index={props.index}>
        {
            (provided, snapshot) =>
                <div className={classNames(
                    "p-2 bg-[#262a30] border border-gray-700 flex flex-col gap-2 transition-opacity",
                    {"border-x-transparent border-t-transparent": !snapshot.isDragging},
                    {"opacity-70": snapshot.isDragging},
                )}
                     ref={provided.innerRef}
                     {...provided.draggableProps}
                     style={provided.draggableProps.style}>
                    <div className={"flex place-items-center"}>
                        <div className={"mr-auto"}>{indi.name}</div>
                        <div{...provided.dragHandleProps}>
                            <MdOutlineMenu className={"text-neutral-500 hover:text-white cursor-grab text-sm"}/>
                        </div>
                        <MdOutlineClose className={"text-neutral-500 hover:text-white cursor-pointer text-sm"}
                                        onClick={() => {
                                            const newArr = [...indicators];
                                            const idx = newArr.indexOf(props.indiData);
                                            newArr.splice(idx, 1);
                                            dispatch(setIndicators(newArr));
                                        }}
                        />
                    </div>
                    {
                        indi.options().map((option, i) => {
                                const k = option.key;
                                const v = props.indiData.options[k];
                                const setOptionVal = (newVal: any) => {
                                    const newOptions = Object.assign({}, props.indiData.options, {[k]: newVal});
                                    const newArr = [...indicators].map(o =>
                                        o.id === props.indiData.id ?
                                            Object.assign({}, o, {options: newOptions}) :
                                            o
                                    );
                                    dispatch(setIndicators(newArr));
                                };
                                const ioProps = {
                                    value: v,
                                    setValue: setOptionVal
                                };
                                return <div key={i} className={"flex place-items-center"}>
                                    <div className={"mr-auto"}>{option.name}</div>
                                    {
                                        {
                                            colour: <ColourField {...ioProps}/>,
                                            integer: <IntergerField {...ioProps}/>,
                                        }[option.type]
                                    }
                                </div>;
                            }
                        )
                    }
                </div>
        }
    </Draggable>;
}
