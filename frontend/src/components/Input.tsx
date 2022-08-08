import { Component } from "solid-js";

const Input: Component<{
  label?: string;
  setValue: (v: string) => void;
  value: any;
  placeHolder?: string;
  id: string;
  twClass?: string;
}> = ({ label, setValue, id, value, placeHolder, twClass }) => {
  return (
    <>
      <label for={id}>{label}</label> <br />
      <input
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
        autocomplete="off"
        type="text"
        id={id}
        class={`focus:outline-none ${twClass}`}
        placeholder={placeHolder}
      />
    </>
  );
};

export default Input;
