import React, { useEffect } from 'react';
import { ProgramVariable, Scenario } from '../../services/api';
import './ControlComponent.scss';
import ButtonComponent from '../SimpleComponents/ButtonComponent';
import InputComponent from '../SimpleComponents/InputComponent';

interface ControlComponentProps {
    // reset the seleted pk
    resetSelection: () => void;
    // all variables of the program + selected variables + change selected variables
    variables: ProgramVariable[];
    selectedVariables: ProgramVariable[];
    setSelectedVariables: (variables: ProgramVariable[]) => void;
    // all scenarios of the program + selected scenarios + change scenarios variables + scenarios colors
    scenarios: Scenario[];
    selectedScenarios: Scenario[];
    setSelectedScenarios: (scenarios: Scenario[]) => void;
    scenarioColors: Record<number, string>;
    // selected mode + change selected mode
    mode: "complet" | "amont-aval";
    setMode: (mode: "complet" | "amont-aval") => void;
    // availables layers + current visible layers 
    layerVisibility?: Record<string, boolean>;
    setLayerVisibility?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    
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

    // reset the selection when the mode is changed
    useEffect(() => {
        resetSelection();
    }, [mode]);
        
    return (
      <div className='control_component'>
        {/* mode selection */}
        <div className="selected_mode">
          <select value={mode} onChange={(e) => setMode(e.target.value as "complet" | "amont-aval")}>
            <option value="complet">Complet</option>
            <option value="amont-aval">Amont-aval</option>
          </select>
          {mode === "amont-aval" && (
            <ButtonComponent txt={"Réinitialiser"} onClick={resetSelection}></ButtonComponent>
          )}
        </div>

        {/* variables selection */}
        <div className='selected_indicators'>
          <h3>Indicateurs</h3>
          {variables.map((variable) => (
            <InputComponent key={variable.var_code}
              disabled={selectedVariables.length == 4 && !selectedVariables.includes(variable)}
              label={variable.var_code.toUpperCase()}
              type={"checkbox"}
              checked={selectedVariables.includes(variable)}
              onChange={(e) => {
                if ((e.target as HTMLInputElement).checked) {
                  setSelectedVariables([...selectedVariables, variable]);
                } else {
                  setSelectedVariables(selectedVariables.filter((v) => v !== variable));
                }
              }}>
            </InputComponent>
          ))}
        </div>
  
        {/* scenarios selection */}
        <div className='selected_scenario'>
          <h3>Scénarios</h3>
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="scenario_container">
              <InputComponent  
                label={scenario.year.toString()}
                type={"checkbox"}
                checked={selectedScenarios.includes(scenario)}
                onChange={(e) => {
                  if ((e.target as HTMLInputElement).checked) {
                    setSelectedScenarios([...selectedScenarios, scenario]);
                  } else {
                    setSelectedScenarios(selectedScenarios.filter((s) => s !== scenario));
                  }
                }}>
              </InputComponent>
              <div className="scenario_color" style={{ backgroundColor: scenarioColors[scenario.id] }}></div>
            </div>
          ))}
        </div>

        {/* layer selection */}
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
