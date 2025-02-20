import React, { useEffect } from 'react';
import { ProgramVariable, Scenario } from '../../services/api';
import './ControlComponent.scss';
import ButtonComponent from '../SimpleComponents/ButtonComponent';
import InputComponent from '../SimpleComponents/InputComponent';

interface ControlComponentProps {
    resetSelection: () => void;
    variables: ProgramVariable[];
    scenarios: Scenario[];
    selectedVariables: ProgramVariable[];
    setSelectedVariables: (variables: ProgramVariable[]) => void;
    selectedScenarios: Scenario[];
    setSelectedScenarios: (scenarios: Scenario[]) => void;
    mode: "complet" | "amont-aval";
    setMode: (mode: "complet" | "amont-aval") => void;
    layerVisibility?: Record<string, boolean>;
    setLayerVisibility?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    scenarioColors: Record<number, string>;
}

const ControlComponent: React.FC<ControlComponentProps> = ({
    resetSelection,
    variables,
    scenarios,
    selectedVariables,
    setSelectedVariables,
    selectedScenarios,
    setSelectedScenarios,
    mode,
    setMode,
    layerVisibility,
    setLayerVisibility,
    scenarioColors
}) => {

    useEffect(() => {
        resetSelection();
    }, [mode]);
        
    return (
      <div className='control_component'>
        {/* Sélection du mode */}
        <div className="mode_selector">
          <InputComponent 
              label={"Complet"}
              type={"radio"}
              checked={mode === "complet"}
              onChange={() => setMode("complet")}>
          </InputComponent>
          <InputComponent 
              label={"Amont-aval"}
              type={"radio"}
              checked={mode === "amont-aval"}
              onChange={() => setMode("amont-aval")}>
          </InputComponent>
        </div>

        {mode === "amont-aval" && (
          <ButtonComponent txt={"Réinitialiser"} onClick={resetSelection}></ButtonComponent>
        )}

        {/* Sélection des variables */}
        <div className='selected_indicators'>
          <h3>Indicateurs</h3>
          {variables.map((variable) => (
            <InputComponent key={variable.var_code}
              disabled={selectedVariables.length == 4 && !selectedVariables.includes(variable)}
              label={variable.var_code.toUpperCase()}
              type={"checkbox"}
              checked={selectedVariables.includes(variable)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedVariables([...selectedVariables, variable]);
                } else {
                  setSelectedVariables(selectedVariables.filter((v) => v !== variable));
                }
              }}>
            </InputComponent>
          ))}
        </div>
  
        {/* Sélection des scénarios */}
        <div>
          <h3>Scénarios</h3>
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="scenario-container">
              <InputComponent  
                label={scenario.year.toString()}
                type={"checkbox"}
                checked={selectedScenarios.includes(scenario)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedScenarios([...selectedScenarios, scenario]);
                  } else {
                    setSelectedScenarios(selectedScenarios.filter((s) => s !== scenario));
                  }
                }}>
              </InputComponent>
              <div className="scenario-color" style={{ backgroundColor: scenarioColors[scenario.id] }}></div>
            </div>
          ))}
        </div>

        {layerVisibility && setLayerVisibility && 
          <div className="selected_layer">
            <h3>Couches</h3>
            {Object.entries(layerVisibility).map(([layer, isVisible]) => (
              <InputComponent 
                key={layer}
                label={layer}
                type={"checkbox"}
                checked={isVisible}
                onChange={() => {
                  setLayerVisibility(prev => ({
                    ...prev,
                    [layer]: !isVisible
                  }));
                }}
              />
            ))}
          </div>}
      </div>
    );
};

export default ControlComponent;
