import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TutoComponent.scss';
import LogoComponent from '../SimpleComponents/LogoComponent';
import Cross from "../../assets/cross.svg?react";
import RightArrow from "../../assets/right_arrow.svg?react";
import Back from "../../assets/back.svg?react";
import ButtonComponent from '../SimpleComponents/ButtonComponent';

interface TutoStep {
  targetClass?: string; 
  content: React.ReactNode;
  route?: string; 
  noContinueButton?: boolean;
}

interface TutoComponentProps {
  isOpen?: boolean;
  onClose?: () => void;
  steps: TutoStep[];
  title?: string;
}

const TutoComponent: React.FC<TutoComponentProps> = ({ isOpen, onClose, steps, title }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const current = steps[currentStep];
  const navigate = useNavigate();
  const location = useLocation();

  // Only handle highlighting here.
  useEffect(() => {
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

    if (current && current.targetClass) {
      const target = document.querySelector(`.${current.targetClass}`);
      if (target) {
        target.classList.add('highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    console.log("test "+location.pathname)

    if (currentStep > 0 && current.route !== undefined && current.route !== location.pathname) {
      setCurrentStep(prev => prev + 1);
      console.log("bad value "+currentStep);
    }
  }, [current, location.pathname]);

  // Cleanup: Remove all highlights on unmount.
  useEffect(() => {
    return () => {
      document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    };
  }, []);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose && onClose();
    }
  };

  const prevStep = () => {
    console.log("curren before "+currentStep);
    if (currentStep > 0) {
      if (steps[currentStep-1].route &&  steps[currentStep-1].route !== location.pathname) {
        navigate(steps[currentStep-1].route!);
      }
      setCurrentStep(prev => prev - 1);
      console.log("curren after "+currentStep);
    } else {
      onClose && onClose();
    }
  };

  return (
    <div className="modal_overlay_tutorial">
      <div className="modal_action" onClick={(e) => e.stopPropagation()}>
        <div className="modal_action_header">
          <h3>{title}</h3>
          <LogoComponent Icon={Cross} onClick={onClose} size="30px" />
        </div>
        <div className="modal_action_body">
          {current.content}
        </div>
        <div className="modal_action_footer" onClick={(e) => e.stopPropagation()}>
          <ButtonComponent
            txt={
              <>
                <p>{currentStep === 0 ? "Quitter" : "Retour"}</p>
                <LogoComponent
                  Icon={currentStep === 0 ? Cross : Back}
                  customColor="--primary-blue"
                  size="30px"
                />
              </>
            }
            onClick={currentStep === 0 ? onClose : prevStep}
          />
          {!current.noContinueButton && (
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
