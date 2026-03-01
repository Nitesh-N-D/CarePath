import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import type { Disease } from "../types/disease";

function DiseaseDetail() {
  const { slug } = useParams();
  const [disease, setDisease] = useState<Disease | null>(null);

  useEffect(() => {
    const fetchDisease = async () => {
      const res = await API.get(`/diseases/${slug}`);
      setDisease(res.data);
    };

    fetchDisease();
  }, [slug]);

  if (!disease) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{disease.name}</h1>
      <p><strong>Body System:</strong> {disease.body_system}</p>
      <p><strong>Category:</strong> {disease.category}</p>
      <p><strong>Symptoms:</strong> {disease.symptoms.join(", ")}</p>
      <p><strong>Causes:</strong> {disease.causes}</p>
      <p><strong>Treatment:</strong> {disease.treatment}</p>
      <p><strong>Prevention:</strong> {disease.prevention}</p>
    </div>
  );
}

export default DiseaseDetail;