import useToggle from "./useToggle";

export default function CustomToggle() {
  const [isOn, toggle] = useToggle();
  return (
    <div>
      <h1>Custom Toggle</h1>
      <button onClick={toggle}>{isOn ? "On" : "Off"}</button>
    </div>
  );
}
