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
  title?: string;
}

const TutoComponent: React.FC<TutoComponentProps> = ({ isOpen, onClose, title }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastPathRef.current && lastPathRef.current === location.pathname) {
      lastPathRef.current = null;
      setCurrentStep(prev => prev - 1);
    } else if (currentStep > 0 && steps[currentStep]?.route && steps[currentStep].route !== location.pathname) {
      setCurrentStep(prev => prev + 1);
    }
  }, [lastPathRef, location.pathname]);

  useEffect(() => {
    // Remove previous highlights
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
  
    if (steps[currentStep]?.targetClass) {
      const targetSelector = `.${steps[currentStep].targetClass}`;
      
      const applyHighlight = () => {
        const target = document.querySelector(targetSelector);
        if (target) {
          console.log("Element found, highlighting:", target);
          target.classList.add('highlight');
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return true; 
        }
        return false; 
      };
  
      if (!applyHighlight()) {
  
        // Create a MutationObserver in order to track the dom when ready
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
    }
  }, [currentStep]);
  

  if (!isOpen) {document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight')); return null;};

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose && onClose();
    }
  };

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
    }
  };

  return (
    <div className="modal_overlay_tutorial" onClick={(e) => e.stopPropagation()}>
      <div className="modal_action" onClick={(e) => e.stopPropagation()}>
        <div className="modal_action_header">
          <h3>{title}</h3>
          <LogoComponent Icon={Cross} onClick={onClose} size="30px" />
        </div>
        <div className="modal_action_body">
          {steps[currentStep]?.content}
        </div>
        <div className="modal_action_footer">
          <ButtonComponent
            txt={
              <>
                <p>{currentStep === 0 ? "Quitter" : "Retour"}</p>
                <LogoComponent Icon={currentStep === 0 ? Cross : Back} customColor="--primary-blue" size="30px" />
              </>
            }
            onClick={currentStep === 0 ? onClose : prevStep}
          />
          {!steps[currentStep]?.noContinueButton && (
            <ButtonComponent
              txt={
                <>
                  <p>Continuer</p>
                  <LogoComponent Icon={RightArrow} customColor="--primary-blue" size="30px" />
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
