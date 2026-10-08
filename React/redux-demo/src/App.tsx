import Counter from "./features/counter/counter";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";

export default function App() {
    const count = useSelector((state: RootState) => state.counter.value);
  return(
    <div>
        <h1> Redux Demo </h1>
        <h2>Counter: {count}</h2>
        <Counter/>
    </div>
  )
}
