// file to make ts understand svg
declare module "*.svg" {
	import React from "react";
	const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
	export { ReactComponent };
	export default ReactComponent;
}
