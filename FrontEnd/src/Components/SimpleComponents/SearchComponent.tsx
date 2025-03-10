import { useRef } from 'react'
import LogoComponent from './LogoComponent'
import Research from "../../assets/research.svg?react";
import './SearchComponent.scss';
import { useState } from 'react';

type Props = {
  // search action when the user type something
  onSearch: (query:string)=>void;
}

export default function SearchComponent({onSearch}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // click function in order to focus the user on the textInput section when clicking the button
  const handleIconClick = () => {
    inputRef.current?.focus();
  };

  // handle the input of the user, when he type in the search bar
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query); 
  };

  return (
    <div className="search_container">
      <input
        ref={inputRef}
        placeholder='Recherche...'
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
      />
      <LogoComponent
        containerSize={"30px"}
        size={"25px"}
        Icon={Research}
        onClick={handleIconClick}
        cursor={"text"}  
      />
    </div>
  )
}

