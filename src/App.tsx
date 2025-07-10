import { ReactFlowProvider } from "@xyflow/react";
import Flow from "./components/Flow";

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
