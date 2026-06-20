import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Lab } from "@/pages/Lab";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lab />} />
      </Routes>
    </Router>
  );
}
