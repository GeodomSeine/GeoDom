import { getColor } from "./mapUtils";

export const scenarioColorPalette = Array.from({ length: 8 }, (_, i) => getColor(`--scenario-${i + 1}`));
