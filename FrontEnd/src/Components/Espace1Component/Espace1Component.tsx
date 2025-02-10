import React, { useEffect} from 'react';
import MapComponent from './MapComponent';
import ControlComponent from './ControlComponent';
import ToggleContainer from '../ToggleComponent/ToggleComponent';
import './Espace1Component.scss';
import { getAmontAval, AmontAvalResponse, Scenario, GeoJsonResponse } from '../../services/api';
import { getScenarios } from '../../services/api';

interface Espace1ComponentProps {
  program: string;
  exutoire_id: number;
  variables: string[];
  selectedVariables: string[];
  setSelectedVariables: (variables: string[]) => void;
  selectedScenarios: Scenario[];
  setSelectedScenarios: (scenarios: Scenario[]) => void;
  setAmontAvalResponse: (response: AmontAvalResponse | null) => void;
  amontAvalResponse: AmontAvalResponse | null;
  selectedPk?: GeoJsonResponse;
  setSelectedPk: (pk: GeoJsonResponse | undefined) => void;
  idHydStart : number | null;
  setIdHydStart : (id : number | null) => void;
  idHydEnd : number | null;
  setIdHydEnd : (id : number | null) => void;
  scenarios : Scenario[];
  setScenarios : (scenario : Scenario[]) => void;
  mode: "complet" | "amont-aval";
  setMode: (mode: "complet" | "amont-aval") => void;
}

const ParentComponent: React.FC<Espace1ComponentProps> = ({
  program,
  exutoire_id,
  variables,
  selectedVariables,
  setSelectedVariables,
  selectedScenarios,
  setSelectedScenarios,
  setAmontAvalResponse,
  amontAvalResponse,
  selectedPk,
  setSelectedPk,
  idHydStart,
  setIdHydStart,
  idHydEnd,
  setIdHydEnd,
  scenarios,
  setScenarios, 
  mode,
  setMode
}) => {

  useEffect(() => {
    const fetchScenarios = async () => {
      const data = await getScenarios();
      if (data) {
        setScenarios(data.scenarios);
  
        // Sélectionner les 3 premiers scénarios par défaut
        if (data.scenarios.length > 0) {
          const firstThreeScenarios = data.scenarios.slice(0, 3);
          setSelectedScenarios(firstThreeScenarios);
        } else {
          setSelectedScenarios(data.scenarios);
        }
      }
    };
    fetchScenarios();
  }, [setSelectedScenarios]);
  

  const fetchResults = async () => {
    if (idHydStart && idHydEnd) {
      const data = await getAmontAval(program, idHydStart, idHydEnd);
      setAmontAvalResponse(data);
    }
  };

  useEffect(() => {
    if(idHydEnd === exutoire_id || (idHydStart && idHydEnd)){
      fetchResults();
    }
  }, [idHydStart, idHydEnd]);

  const resetSelection = () => {
    setIdHydStart(null);
    setIdHydEnd(null);
    setAmontAvalResponse(null);
    setSelectedPk(undefined);
  };

  return (
    <div className='space1'>
      {/* Section MapComponent */}
      <ToggleContainer title="Paramètrage général">
        <MapComponent
          program={program}
          exutoire_id={exutoire_id}
          idHydStart={idHydStart}
          idHydEnd={idHydEnd}
          setIdHydStart={setIdHydStart}
          setIdHydEnd={setIdHydEnd}
          amontAvalResponse={amontAvalResponse}
          selectedPk={selectedPk}
          mode={mode}
        />
        <ControlComponent
          idHydStart={idHydStart}
          idHydEnd={idHydEnd}
          resetSelection={resetSelection}
          variables={variables}
          selectedVariables={selectedVariables}
          setSelectedVariables={setSelectedVariables}
          selectedScenarios={selectedScenarios}
          setSelectedScenarios={setSelectedScenarios}
          scenarios={scenarios}
          mode={mode}
          setMode={setMode}
        />
      </ToggleContainer>
    </div>
  );
};

export default ParentComponent;
