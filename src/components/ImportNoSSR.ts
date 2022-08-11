import dynamic from 'next/dynamic';
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";

const _DragDropContext = dynamic(
    () =>
        import('react-beautiful-dnd').then(mod => {
            return mod.DragDropContext;
        }),
    {ssr: false},
) as typeof DragDropContext;
const _Droppable = dynamic(
    () =>
        import('react-beautiful-dnd').then(mod => {
            return mod.Droppable;
        }),
    {ssr: false},
) as typeof Droppable;
const _Draggable = dynamic(
    () =>
        import('react-beautiful-dnd').then(mod => {
            return mod.Draggable;
        }),
    {ssr: false},
) as typeof Draggable;
export {_DragDropContext, _Droppable, _Draggable};
