import { useDispatch } from "react-redux";
import { increment, decrement, reset } from "./counterSlice";
import type { AppDispatch } from "../../app/store";

export default function Counter() {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div>
      <button onClick={() => dispatch(increment())}>Increment</button>
      <button onClick={() => dispatch(decrement())}>Decrement</button>
      <button onClick={() => dispatch(reset())}>Reset</button>
    </div>
  );
}
