import React, {useMemo, useEffect, useState} from "react";
import "./Espace3Component.scss";
import ToggleComponent from "../Visulisation/ToggleComponent";
import { Space3DataRequest, getSpace3Data, GeoJsonResponse } from "../../services/api";
import MapComponent from "./MapComponent";

interface Esapce3ComponentProps {
  program: string;
}
const Esapce3Component: React.FC<Esapce3ComponentProps> = ({program}) => {
  const [space3Data, setSpace3Data] = useState<GeoJsonResponse | null>(null);

  const variables = ["ta"];
  const decades = [1, 2, 3];
  const scenarios = [1, 2];

  const request: Space3DataRequest | null = useMemo(() => {
    if (!program) return null;

    return {
      program: program,
      scenarios: scenarios,
      variables: variables,
      decades: decades
    };
  }, [program]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSpace3Data(request);
      setSpace3Data(response);
    }
    fetchData();

  }, [request]);
  
  return (
    <div className='space3'>
      {/* implement the space3 here please */}
      <ToggleComponent title="Profil en Long">
        <div>
          <div className="space3_map">
            { space3Data &&
              <MapComponent program={program} space3Data={space3Data} variables={variables}/>
            }
          </div>
          <div className="space3_chart">put the chart here</div>
        </div>
        <div>
        {/* <SliderComponent min={} max={} step={} onChange={} /> */}
        </div>
      </ToggleComponent>
    </div>
  );
};

export default Esapce3Component;
