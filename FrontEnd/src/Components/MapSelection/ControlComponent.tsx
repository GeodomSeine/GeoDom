import React, { useEffect } from 'react';
import { Scenario } from '../../services/api';
import './ControlComponent.scss';
import ButtonComponent from '../SimpleComponents/ButtonComponent';
import InputComponent from '../SimpleComponents/InputComponent';

interface ControlComponentProps {
    idHydStart: number | null;
    idHydEnd: number | null;
    resetSelection: () => void;
    variables: string[];
    scenarios: Scenario[];
    selectedVariables: string[];
    setSelectedVariables: (variables: string[]) => void;
    selectedScenarios: Scenario[];
    setSelectedScenarios: (scenarios: Scenario[]) => void;
    mode: "complet" | "amont-aval";
    setMode: (mode: "complet" | "amont-aval") => void;
  }

  const ControlComponent: React.FC<ControlComponentProps> = ({
    idHydStart,
    idHydEnd,
    resetSelection,
    variables,
    scenarios,
    selectedVariables,
    setSelectedVariables,
    selectedScenarios,
    setSelectedScenarios,
    mode,
    setMode,
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
          <div className='selected_pks'>
            {/* Logique amont-aval ici */}
            <h3><>ID Start :</> {idHydStart || 'Non sélectionné'}</h3>
            <h3><>ID End :</> {idHydEnd || 'Non sélectionné'}</h3>
            <div style={{ display: "flex", flexDirection: 'column', gap: "5px" }}>
              <ButtonComponent txt={"Réinitialiser"} onClick={resetSelection}></ButtonComponent>
            </div>
          </div>
        )}

        {/* Sélection des variables */}
        <div className='selected_indicators'>
          <h3>Indicateurs</h3>
          {variables.map((variable) => (
            <InputComponent disabled ={selectedVariables.length == 4 && !selectedVariables.includes(variable)} // limité à 4
              label={variable}
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
            <InputComponent  key={scenario.id} 
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
          ))}
        </div>
      </div>
    );
  };
  
export default ControlComponent;
