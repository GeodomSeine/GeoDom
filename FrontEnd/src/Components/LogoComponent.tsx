import React, { FC } from "react";
import HomeLogo from "../assets/logo.svg?react";
import { GeoJsonResponse, Scenario } from "../services/api";

interface LogoComponentProps {
    containerSize?: string | number;
    size?: string | number;
    link?: string | null;
    Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    customColor?: string;
    className?:string |null;
    onClick?: () => void;
    program: string;
    selectedVariables: string[];
    selectedScenarios: Scenario[];
    idHydStart: number | null;
    idHydEnd: number | null;
    download: boolean;
    selectedPk : GeoJsonResponse | undefined;
    selectedStralher : string | null;
}

const LogoComponent: FC<LogoComponentProps> = ({
    size = "70px",
    link = null,
    Icon = HomeLogo,
    customColor = "var(--basic-black)",
    containerSize = size,
    className= "logo_container",
    onClick,
    program,
    selectedVariables,
    selectedScenarios,
    idHydStart,
    idHydEnd,
    download,
    selectedPk,
    selectedStralher
}) => {
    
    const containerStyle: React.CSSProperties = {
        width: containerSize,
        height: containerSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: customColor,
    };
    const svgStyle: React.CSSProperties = {
        width: size,
        height: size,
    };
    
    if (link && download) { // export de la session
        onClick = () => {
            const data = {
                name : program,
                complete : selectedStralher !== null, // ordre stralher à rajouter
                selected_order : selectedStralher, // ordre stralher  à rajouter
                pk_start : idHydStart,
                pk_end : idHydEnd,
                selected_pk : selectedPk,
                variables : selectedVariables,
                scenarios : selectedScenarios
                
            };
            const jsonString = JSON.stringify(data, null,'\t');
            const blob = new Blob([jsonString], {type : 'applicatioin/json'});
            console.log(blob);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); // link
            a.href = url;
            a.download = link;
            a.click();
            URL.revokeObjectURL(url);
        }
        return (
            <Icon style={svgStyle} onClick={onClick}/>
        );
    }
    
    return (
        <div className={`${className}`}  style={containerStyle} onClick={onClick}>
            <Icon style={svgStyle}/>
        </div>
    );
};

export default LogoComponent;