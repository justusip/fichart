import React, {useState} from "react";
import classNames from "classnames";

export default (props: { value: any, setValue: (val: any) => any }) => {
    const [value, setValue] = useState(props.value);
    const [valid, setValid] = React.useState(true);
    return <input
        className={classNames(
            "w-24 m-0 px-1 py-1 bg-transparent border border-gray-500/50",
            {"bg-red-500/25": !valid}
        )}
        value={value}
        onChange={e => {
            const newVal = e.target.value;
            setValue(newVal);
            if (!(/^\d+$/.test(newVal))) {
                setValid(false);
                return;
            }
            setValid(true);
            props.setValue(parseInt(newVal));
        }}
        onBlur={() => {
            if (!valid) {
                setValue(props.value);
                setValid(true);
            }
        }}
    />;
}
