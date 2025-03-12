import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TutoComponent.scss';
import LogoComponent from '../SimpleComponents/LogoComponent';
import Cross from "../../assets/cross.svg?react";
import RightArrow from "../../assets/right_arrow.svg?react";
import Back from "../../assets/back.svg?react";
import ButtonComponent from '../SimpleComponents/ButtonComponent';
import { steps } from '../../utils/tutorialSteps';

interface TutoComponentProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const TutoComponent: React.FC<TutoComponentProps> = ({ isOpen, onClose }) => {
  // rememeber the current step in the tutorial
  const [currentStep, setCurrentStep] = useState(0);
  // const used to navigate
  const navigate = useNavigate();
  // gettting the current location path (example home page its '/') 
  const location = useLocation();
  const lastPathRef = useRef<string | null>(null);

  // check if the path name correspond the current path when lastPathRef or location.current changes, in order to correctly track where the user is through the pages
  useEffect(() => {
    if (lastPathRef.current && lastPathRef.current === location.pathname) {
      lastPathRef.current = null;
      setCurrentStep(prev => prev - 1);
    } else if (currentStep > 0 && steps[currentStep]?.route && steps[currentStep].route !== location.pathname) {
      setCurrentStep(prev => prev + 1);
    }
  }, [lastPathRef, location.pathname]);

  // update a lot of things when the current path is changed
  useEffect(() => {
    // Remove previous highlights
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    document.querySelector('.modal_overlay_tutorial')?.classList.remove('right_bottom', 'left_bottom');

    // apply the highlight of the currentStep
    if (steps[currentStep]?.targetClass) {
      const targetSelector = `.${steps[currentStep].targetClass}`;
      
      const applyHighlight = () => {
        const target = document.querySelector(targetSelector);
        if (target) {
          target.classList.add('highlight');
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return true; 
        }
        return false; 
      };
  
      // track the applied highlight
      if (!applyHighlight()) {
        // create a MutationObserver in order to track the dom when ready
        const observer = new MutationObserver((__, obs) => {
          if (applyHighlight()) {
            obs.disconnect(); 
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,   
        });
  
        setTimeout(() => observer.disconnect(), 2000);
      }
      // Remove previous position of the tutorial window, in order to update it correctly
      const targetClass = document.querySelector(".modal_overlay_tutorial");
      if(currentStep>0){
        targetClass?.classList.remove(steps[currentStep-1].position!);
      }
      targetClass?.classList.add(steps[currentStep].position!);
    }
  }, [currentStep]);
  

  // return and clean all highlights, if the tutorial is closed
  if (!isOpen) {document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight')); return null;};

   /**
   * set the next step and update it
   * @param void
   * @returns void
   */
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose && onClose();
      setCurrentStep(0);
    }
  };

  /**
   * set the previous step, if the user go back, and checking the current back-Path
   * @param void
   * @returns void
   */
  const prevStep = () => {
    if (currentStep > 0) {
      const prevRoute = steps[currentStep - 1]?.route;
      if (prevRoute && prevRoute !== location.pathname) {
        lastPathRef.current = prevRoute;
        navigate(prevRoute);
      } else {
        setCurrentStep(prev => prev - 1);
      }
    } else {
      onClose && onClose();
      setCurrentStep(0);
    }
  };

  return (
    
    <div className="modal_overlay_tutorial" onClick={(e) => e.stopPropagation()}>
      {/* Copy of the modal action, behave slightly different */}
      <div className="modal_action" onClick={(e) => e.stopPropagation()}>
        <div className="modal_action_header">
          <h3>{steps[currentStep]?.title}</h3>
          {/* Quit logo */}
          <LogoComponent Icon={Cross} onClick={() => {onClose && onClose(); setCurrentStep(0);}} size="30px" />
        </div>
        <div className="modal_action_body">
          {steps[currentStep]?.content}
        </div>
        {/* Back or continue button */}
        <div className="modal_action_footer">
          <ButtonComponent
            children={
              <>
                {currentStep === 0 ? "Quitter" : "Retour"}
                <LogoComponent cursor='default' Icon={currentStep === 0 ? Cross : Back} customColor="--primary-blue" size="30px" />
              </>
            }
            onClick={currentStep === 0 ? onClose : prevStep}  
          />
          {!steps[currentStep]?.noContinueButton && (
            <ButtonComponent
            children={
                <>
                  Continuer
                  <LogoComponent cursor='default' Icon={RightArrow} customColor="--primary-blue" size="30px" />
                </>
              }
              onClick={nextStep}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TutoComponent;
