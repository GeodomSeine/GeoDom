import { useEffect, useState } from 'react';
import { getPrograms, ProgramResponse, ProgramVariable } from '../../services/api'; 
import CardComponent from './CardComponent'; 
import "./HomeComponent.scss";
import HeaderComponent from './HeaderComponent';
import { Program } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import FooterComponent from '../SimpleComponents/FooterComponent';
import { useAuth } from '../Admin/Auth/AuthContext';

    type Props = {
        setTutorialOpen?: (value: boolean) => void;
    }

    export default function HomeComponent({setTutorialOpen}: Props) {
        const [programs, setPrograms] = useState<ProgramResponse | null>(null);
        const [searchQuery, setSearchQuery] = useState(""); 
        const navigate = useNavigate();
        const { token } = useAuth();

        useEffect(() => {
            const fetchPrograms = async () => {
                const data = await getPrograms();
                setPrograms(data);
                localStorage.setItem("programs", JSON.stringify(data));
            };
            fetchPrograms();
        }, []);

        const handleCardClick = (selectedProgram: Program) => {
            navigate(`/${selectedProgram.name}`);
        };

        const filteredPrograms = Array.isArray(programs) ? programs.filter((item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        ):( [] );

        const visualizationData = Array.isArray(programs) ? programs.map(program => ({
            name: program.name,
            variables: program.variables.map((variable:ProgramVariable) => variable.var_code)
        })) : [];
        
        return (
            <div className='home_component'>
                <HeaderComponent onSearch={setSearchQuery} showImportButton={true} visualizationData={visualizationData} setTutorialOpen={setTutorialOpen}></HeaderComponent>
                <div className="main_body">
                    <div className='main_scroll_area' >
                        {/* need to add a condition in order for the tutorial to work and to recognize the "carbone dans l'orgeval" */}
                        {searchQuery ? (filteredPrograms.length > 0 ? filteredPrograms.map((item: Program) => (
                                    item.background && (
                                        <CardComponent
                                            key={item.name}
                                            title={item.title}
                                            description={item.description}
                                            variables={item.variables.map(variable => variable.var_code.toUpperCase())}
                                            background={item.background}
                                            onClick={(item.is_actived || token) ? (() => handleCardClick(item)) : () => {}}
                                            is_actived={item.is_actived}
                                        />
                                    )
                                ))
                                : <div className="no_results">Pas de résulats.</div>
                            )
                            : (Array.isArray(programs) && programs.map((item: Program) => (
                                item.background && (
                                    <CardComponent
                                        key={item.name}
                                        title={item.title}
                                        description={item.description}
                                        variables={item.variables.map(variable => variable.var_code.toUpperCase())}
                                        background={item.background}
                                        onClick={(item.is_actived || token) ? (() => handleCardClick(item)) : () => {}}
                                        is_actived={item.is_actived}
                                        />
                                )
                            )))
                        }
                    </div>
                </div>
                <FooterComponent names={["Ahmed SOUSSI","Brice PANIZZI","Corentin VIRY","Marius LEMAIRE"]}></FooterComponent>
            </div>
        );
    }
