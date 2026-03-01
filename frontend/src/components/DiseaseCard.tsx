import { Link } from "react-router-dom";
import type { Disease } from "../types/disease";

interface Props {
  disease: Disease;
}

function DiseaseCard({ disease }: Props) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
      <h3 className="text-xl font-semibold text-blue-700">
        {disease.name}
      </h3>

      <p
        className="text-gray-600 mt-2"
        dangerouslySetInnerHTML={{
          __html: disease.highlighted_causes || disease.causes,
        }}
      />

      <Link
        to={`/disease/${disease.slug}`}
        className="inline-block mt-3 text-blue-600 hover:underline"
      >
        Read More →
      </Link>
    </div>
  );
}

export default DiseaseCard;