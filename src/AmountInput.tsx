import Input, { type InputProps } from "./Input";

export default function AmountInput(props: InputProps) {
  return (
    <div className="flex w-full items-center rounded-xl border border-border bg-panel transition-colors duration-150 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
      <Input
        id={props.id}
        placeholder="Amount"
        className="w-full min-w-0 border-0 bg-transparent py-3 pl-5 text-left text-3xl font-medium text-fg outline-none placeholder:text-muted focus:ring-0"
        value={props.value}
        onChange={props.onChange}
      />
      <span className="px-5 text-sm text-muted">USD</span>
    </div>
  );
}
