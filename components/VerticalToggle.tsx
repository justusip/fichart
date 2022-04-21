import React from "react";
import classNames from "classnames";

export default (props: React.PropsWithChildren<{
    isToggled: boolean,
    onToggle: () => void,
    icon: JSX.Element
}>) =>
    <div
        className={classNames(
            "w-4 py-2 border-b border-gray-700 flex flex-col place-items-center cursor-pointer",
            "hover:bg-white hover:bg-opacity-5 active:bg-black active:bg-opacity-30",
            {"bg-black bg-opacity-50": props.isToggled}
        )}
        onClick={() => props.onToggle()}>
        {props.icon}
        <div className={"mt-1 owo"}>{props.children}</div>
    </div>
