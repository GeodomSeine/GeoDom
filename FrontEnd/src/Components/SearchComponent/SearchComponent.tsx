import { useRef } from 'react'
import LogoComponent from '../LogoComponent'
import Research from "../../assets/research.svg?react";
import './SearchComponent.scss';

type Props = {}

export default function SearchComponent({}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleIconClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="search_container">
      <input
        ref={inputRef}
        placeholder='Recherche...'
        type="text"
      />
      <LogoComponent
        containerSize={"35px"}
        size={"20px"}
        customColor={"var(--shade-lighter-grey)"}
        Icon={Research}
        onClick={handleIconClick} program={''} selectedVariables={[]} selectedScenarios={[]} idHydStart={null} idHydEnd={null} download={false} selectedPk={undefined} selectedStralher={null}      />
    </div>
  )
}

