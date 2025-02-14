import LogoComponent from '../SimpleComponents/LogoComponent'
import Import from "../../assets/import.svg?react"
import "./HeaderComponent.scss";
import SearchComponent from '../SimpleComponents/SearchComponent'
import { useNavigate } from 'react-router';

interface HeaderComponentProps {
    actionButton:() => void;
    onSearch?: (query:string)=>void;
}

const HeaderComponent : React.FC<HeaderComponentProps> = ({
    actionButton = () => "test",
    onSearch,
}) => {
    const navigate = useNavigate();
    const clicked =  () => {
        navigate('/');
    };
    return (
        <div className="header_component">
            <LogoComponent size={"50px"} onClick={clicked}/>
            <div className='action_header'>
                {onSearch && <SearchComponent onSearch={onSearch}/>}
                <LogoComponent size={"35px"} Icon={Import} onClick={actionButton}/>
            </div>
        </div>
    )
}

export default HeaderComponent;
