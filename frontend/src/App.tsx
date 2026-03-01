import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DiseaseDetail from "./pages/DiseaseDetail";
import Layout from "./components/Layout";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/disease/:slug" element={<DiseaseDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;