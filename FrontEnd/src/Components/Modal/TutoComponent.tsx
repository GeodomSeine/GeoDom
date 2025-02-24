import React, { useState, useEffect } from 'react';
import './TutoComponent.scss';
import LogoComponent from '../SimpleComponents/LogoComponent';
import Cross from "../../assets/cross.svg?react";
import Arrow from "../../assets/right_arrow.svg?react";
import ButtonComponent from '../SimpleComponents/ButtonComponent';

interface TutoStep {
  targetClass: string;
  content: React.ReactNode;    
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

  useEffect(() => {
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    
    if (current) {
      const target = document.querySelector(`.${current.targetClass}`);
      if (target) {
        target.classList.add('highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [current, steps]);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose && onClose();
    }
  };

  return (
    <div className="modal_overlay_tutorial" onClick={onClose}>
      <div className="modal_action" onClick={(e) => e.stopPropagation()}>
        <div className="modal_action_header">
          <h3>{title}</h3>
          <LogoComponent
            Icon={Cross}
            onClick={onClose}
            size={"30px"}
          />
        </div>
        <div className="modal_action_body">
          {current.content}
        </div>
        <div className="modal_action_footer" onClick={(e) => e.stopPropagation()}>
        <ButtonComponent
            txt={
                <>
                  <p>Quitter</p>
                  <LogoComponent
                    Icon={Cross}
                    customColor="--primary-blue"
                    size={"30px"}
                  />
                </>
              }
            onClick={onClose}
          />
          <ButtonComponent
            txt={
              <>
                <p>Continuer</p>
                <LogoComponent
                  Icon={Arrow}
                  customColor="--primary-blue"
                  size={"30px"}
                />
              </>
            }
            onClick={nextStep}
          />
        </div>
      </div>
    </div>
  );
};

export default TutoComponent;
