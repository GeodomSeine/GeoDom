import { useEffect, useState } from 'react';
import { getPrograms, ProgramResponse, ProgramVariable } from '../../services/api'; 
import CardComponent from './CardComponent'; 
import "./HomeComponent.scss";
import HeaderComponent from './HeaderComponent';
import { Program } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import FooterComponent from '../SimpleComponents/FooterComponent';

    type Props = {}

    export default function HomeComponent({}: Props) {
        const [programs, setPrograms] = useState<ProgramResponse | null>(null);
        const [searchQuery, setSearchQuery] = useState(""); 
        const navigate = useNavigate();

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
                <HeaderComponent onSearch={setSearchQuery} showImportButton={true} visualizationData={visualizationData}></HeaderComponent>
                <div className="main_body">
                    <div className='main_scroll_area' >
                        {searchQuery ? (filteredPrograms.length > 0 ? filteredPrograms.map((item: Program) => (
                                    item.background && (
                                        <CardComponent
                                            key={item.name}
                                            title={item.title}
                                            description={item.description}
                                            variables={item.variables.map(variable => variable.var_code.toUpperCase())}
                                            background={item.background}
                                            onClick={() => handleCardClick(item)}
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
                                        onClick={() => handleCardClick(item)}
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
