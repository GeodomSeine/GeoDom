import LogoComponent from '../LogoComponent'
import Import from "../../assets/import.svg?react"
import "./HeaderComponent.scss";
import SearchComponent from '../SearchComponent/SearchComponent'
import { useNavigate } from 'react-router';

interface HeaderComponentProps {
    actionButton:() => void;
}

const HeaderComponent : React.FC<HeaderComponentProps> = ({
    actionButton = () => "test",
}) => {
    const navigate = useNavigate();
    const clicked =  () => {
        navigate('/');
    };
    return (
        <div className="header_component">
            <LogoComponent size={"50px"} onClick={clicked}/>
            <div className='action_header'>
                <SearchComponent></SearchComponent>
                <LogoComponent size={"35px"} Icon={Import} onClick={actionButton}/>
            </div>
        </div>
    )
}

export default HeaderComponent;
