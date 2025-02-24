import React, { FC } from "react";
import "./ButtonComponent.scss";

interface ButtonComponentProps {
	link?: string;
	txt?: string | React.ReactNode;
	className?:string;
	onClick?: () => void;
	onDark?: boolean |null;
}

const ButtonComponent: FC<ButtonComponentProps> = ({
	link = null,
	txt = "clicky",
	className= "button_container",
	onDark = false,
	onClick,

}) => {
    //need to put into a seperate scss file
	const containerStyle: React.CSSProperties = {
        cursor: "pointer",
	};


	const appliedClassName = `${className}${onDark ? " button_on_dark" : ""}`;
	if (link) {
		return (
			<a
				className={appliedClassName}
				href={link}
				target="_blank"
				rel="noopener noreferrer"
				style={containerStyle}
				onClick={onClick}
			>
                {txt}
			</a>
		);
	} else {
		return (
			<div className={appliedClassName}  style={containerStyle} onClick={onClick}>
				{txt}
			</div>
		);
	}
};

export default ButtonComponent;