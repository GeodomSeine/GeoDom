    import React, { useEffect } from 'react';
    import { getPrograms, ProgramResponse } from '../../services/api'; 
    import CardComponent from './CardComponent'; 
    import "./HomeComponent.scss";
    import HeaderComponent from '../HeaderComponent/HeaderComponent';
    import { useProgram } from '../../contexts/ProgramContext';
    import { Program } from '../../services/api';
    import { useNavigate } from 'react-router-dom';

    type Props = {}

    export default function HomeComponent({}: Props) {
        const [programs, setPrograms] = React.useState<ProgramResponse | null>(null);

        const { setProgram } = useProgram();
        const navigate = useNavigate();

        useEffect(() => {
            const fetchPrograms = async () => {
                const data = await getPrograms();
                setPrograms(data);
            };
            fetchPrograms();
        }, []);

        const handleCardClick = (selectedProgram: Program) => {
            setProgram(selectedProgram);
            navigate('/visualisation');
        };

        return (
            <div className='home_component'>
                <HeaderComponent actionButton={()=>{}}></HeaderComponent>
                <div className="main_body">
                    <div className='main_scroll_area' >
                        {Array.isArray(programs) && programs.map((item: Program) => (
                            item.background && ( 
                                <CardComponent
                                    key={item.name}
                                    title={item.title}
                                    description={item.description}
                                    variables={item.variables}
                                    background={item.background}
                                    onClick={() => handleCardClick(item)}
                                />
                            )
                        ))}
                    </div>
                </div>
            </div>
        );
    }
