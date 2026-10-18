import type { ChangeEventHandler } from "react";

export type InputProps = {
  id?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
  placeholder?: string;
};

export default function Input(props: InputProps) {
  return (
    <input
      id={props.id}
      type="text"
      placeholder={props.placeholder || ""}
      className={`rounded-none ${props.className ?? ""}`}
      value={props.value}
      onChange={props.onChange}
    />
  );
}
