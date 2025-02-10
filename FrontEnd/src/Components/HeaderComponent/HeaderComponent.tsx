import LogoComponent from '../LogoComponent'
import Import from "../../assets/import.svg?react"
import "./HeaderComponent.scss";
import SearchComponent from '../SearchComponent/SearchComponent'
import { useNavigate } from 'react-router';
import { GeoJsonResponse, Scenario } from '../../services/api';

interface HeaderComponentProps {
    program: string;
    selectedVariables: string[];
    selectedScenarios: Scenario[];
    idHydStart: number | null;
    idHydEnd: number | null;
    selectedPk: GeoJsonResponse | undefined;
    selectedStralher: string | null;
}

const HeaderComponent : React.FC<HeaderComponentProps> = ({
    program,
    selectedVariables,
    selectedScenarios,
    idHydStart,
    idHydEnd,
    selectedPk,
    selectedStralher
}) => {
    const navigate = useNavigate();
    const clicked =  () => {
        navigate('/');
    };
    return (
        <div className="header_component">
            {/*need to change and adjust the logo*/}
            <LogoComponent size={"50px"} link="/" onClick={clicked} program={''} selectedVariables={[]} selectedScenarios={[]} idHydStart={null} idHydEnd={null} download={false} selectedPk={selectedPk} selectedStralher={null}/>
            <div className='action_header'>
                <SearchComponent></SearchComponent>
                {/* here when the LogoComponent gets a link, it wrap the logo around an a href instead of a div (prout is temporary no worries)}*/}
                <LogoComponent size={"35px"} Icon={Import} link="configuration.json" program={program} selectedVariables={selectedVariables} selectedScenarios={selectedScenarios} idHydStart={idHydStart} idHydEnd={idHydEnd} download={true} selectedPk={selectedPk} selectedStralher={selectedStralher}/>
            </div>
        </div>
    )
}

export default HeaderComponent;
