import { useRef } from 'react'
import LogoComponent from '../LogoComponent'
import Research from "../../assets/research.svg?react";
import './SearchComponent.scss';
import { useState } from 'react';


type Props = {}

export default function SearchComponent({}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleIconClick = () => {
    inputRef.current?.focus();
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value); 
  };

  return (
    <div className="search_container">
      <input
        ref={inputRef}
        placeholder='Recherche...'
        type="text"
        onChange={handleInputChange}
      />
      <LogoComponent
        containerSize={"30px"}
        size={"20px"}
        customColor={"var(--shade-lighter-grey)"}
        Icon={Research}
        onClick={handleIconClick}
        cursor={"text"}  
      />
    </div>
  )
}

