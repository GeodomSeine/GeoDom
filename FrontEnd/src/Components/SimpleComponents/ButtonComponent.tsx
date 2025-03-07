import React, { FC } from "react";
import "./ButtonComponent.scss";

interface ButtonComponentProps {
	// link or not, txt of the button
	link?: string;
	txt?: string | React.ReactNode;
	className?:string;
	// action to do when the button is clicked
	onClick?: () => void;
	// style when the button is on a darker area
	onDark?: boolean |null;
}

const ButtonComponent: FC<ButtonComponentProps> = ({
	link = null,
	txt = "clicky",
	className= "button_container",
	onDark = false,
	onClick,

}) => {
	
	const containerStyle: React.CSSProperties = {
        cursor: "pointer",
	};


	// return 'a' when there is a link, or else a 'div'
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