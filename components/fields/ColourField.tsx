export default (props: { value: any, setValue: (val: any) => any }) => {
    return <input className={"bg-transparent p-0"}
                  type={"color"}
                  value={props.value}
                  onChange={e => {
                      props.setValue(e.target.value);
                  }}/>;
}
