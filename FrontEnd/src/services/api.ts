import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", //dev env http://127.0.0.1:8000
  headers: {
    "Content-Type": "application/json",
  },
});

/* SelectionMap types */
export interface GeoJsonFeature {
  type: string;
  properties: any;
  geometry: {
    type: string;
    coordinates: any[];
  };
}

export interface GeoJsonResponse {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: GeoJsonFeature[];
}

export interface Pk {
  id_obj: number;
  pk: number;
  strahler: number;
  obj_ord_pk: string;
}

export interface AmontAvalResponse {
  id_hyd: number[];
  pk: Pk[];
}

/*Program (home) types and interfaces */
export interface Program {
  name: string;
  title: string;
  description: string;
  variables: ProgramVariable[];
  exutoire_id: number;
  background: string;
  is_actived: boolean;
}

export interface ProgramVariable {
  var_code: string;
  var_name: string;
  unit_short: string;
}

export interface ProgramResponse {
  programs?: Program[];
}

/* Data by pk (Time graphs) types and interfaces */
export interface DataRequest {
  program: string;
  scenarios: number[];
  variables: string[];
  pk: Pk[];
}

export interface DataPoint {
  decade: number;
  [variable: string]: number;
}

export interface DataResponse {
  [key: string]: { data: DataPoint[] };
}

/* Data by strahler (Time graphs) types and interfaces */
export interface DataRequestFull {
  program: string;
  scenarios: number[];
  variables: string[];
}

/*Scenario types and interfaces */
export interface Scenario {
  id: number;
  code: string;
  description: string;
  year: number;
}

export interface ScenarioResponse {
  scenarios: Scenario[];
}

/* Colored map types and interfaces */
interface ColorData {
  range : [number, number];
  color: string;
}

export interface LegendData{
  sld: boolean;
  classification?: string;
  nb_classes?: number;
  colors?: ColorData[];
}

interface VariableData {
  [key: string]: number;
}

interface Data {
  [objOrdPk: string]: VariableData;
}

interface Legend {
  [variable: string]: LegendData;
}

export interface ColoredMapResponseData{
  data: Data;
  legend: Legend;
}

export interface ColorMapRequest{
  program : string, 
  scenarios : number[], 
  decades: number[], 
  variables: string[]
}

export interface ProfileGraphPkRequest{
  program : string, 
  scenarios : number[], 
  decades: number[], 
  variables: string[], 
  pk: Pk[]
}

export interface ProfileGraphDataResponse{
  [strahlerOrObjOrdPk: string]: VariableData;
}

// Donuts data interfaces and types
interface ScenarioAndValue {
  scenario: number;
  value: number;
}

export interface DecadeScenarioValue {
  [decade: string]: ScenarioAndValue[];
}

interface VariableDecadeScenarioValue {
  [variable: string]: DecadeScenarioValue;
}

export interface DonutsDataResponse {
  [key: string]: VariableDecadeScenarioValue;
}

// get donuts data function

export const getDonutsData = async (request: DataRequest) : Promise<DonutsDataResponse | null> => {
  try{
    const response = await api.post<DonutsDataResponse>("/data_donuts/data", request);
    return response.data;
  }catch(error){
    console.error("Error fetching donuts data:", error);
    return null;
  }
}

export const getExportHydroData = async (program: string): Promise<Blob | null> => {
  try {
    const response = await api.get(`/hydro/export/${program}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching hydro data:", error);
    return null;
  }
};


export const getDonutsFullData = async (request: DataRequestFull) : Promise<DonutsDataResponse | null> => {
  try{
    const response = await api.post<DonutsDataResponse>("/data_donuts/fulldata", request);
    return response.data;
  }catch(error){
    console.error("Error fetching donuts data:", error);
    return null;
  }
}

export const getAval = async (
  program: string,
  id_hyd: number
): Promise<AmontAvalResponse | null> => {
  try {
    const response = await api.get<AmontAvalResponse>(
      `/aval/${program}/${id_hyd}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Aval data:", error);
    return null;
  }
};

export const getAmontAval = async (
  program: string,
  id_hyd_start: number,
  id_hyd_end: number
): Promise<AmontAvalResponse | null> => {
  try {
    const response = await api.get<AmontAvalResponse>(
      `/amont_aval/${program}/${id_hyd_start}/${id_hyd_end}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching AmontAval data:", error);
    return null;
  }
};

export const getScenarios = async (): Promise<ScenarioResponse | null> => {
  try {
    const response = await api.get<ScenarioResponse>("/scenarios");
    return response.data;
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return null;
  }
};

// Récupérer le fichier SLD pour Bassin
export const getSld = async (uri: string): Promise<Blob | null> => {
  try {
    const response = await api.get<Blob>(uri, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching SLD:", error);
    return null;
  }
};

// Récupérer les données Hydro
export const getHydro = async (
  program: string
): Promise<GeoJsonResponse | null> => {
  try {
    const response = await api.get<GeoJsonResponse>(`/hydro/${program}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Hydro data:", error);
    return null;
  }
};

// Récupérer les données Bassin
export const getBassin = async (
  program: string
): Promise<GeoJsonResponse | null> => {
  try {
    const response = await api.get<GeoJsonResponse>(
      `/bassin/${program}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Bassin data:", error);
    return null;
  }
};

// Récupérer le fichier SLD pour Hydro
export const getHydroSLD = async (program: string): Promise<Blob | null> => {
  return getSld(`/sld/hydro/${program}`);
};

// Récupérer le fichier SLD pour Bassin
export const getBassinSLD = async (program: string): Promise<Blob | null> => {
  return getSld(`/sld/bassin/${program}`);
};

// Récupérer le fichier SLD pour PK
export const getPkSld = async (program: string): Promise<Blob | null> => {
  return getSld(`/sld/pk/${program}`);
};

export const getData = async (
  request: DataRequest
): Promise<DataResponse | null> => {
  try {
    const response = await api.post<DataResponse>("/data", request);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const processData = (
  response: DataResponse,
  selectedVariables: string[]
) => {
  const result: Record<string, Partial<DataPoint>[]> = {};

  // Itérer sur les clés dynamiques
  Object.keys(response).forEach((key) => {
    const data = response[key].data;

    // Filtrer et formater les données selon les variables sélectionnées
    const processedData = data.map((entry) => {
      const filteredEntry: Partial<DataPoint> = { decade: entry.decade };

      selectedVariables.forEach((variable) => {
        filteredEntry[`${variable}_p5`] = entry[`${variable}_p5`];
        filteredEntry[`${variable}_p50`] = entry[`${variable}_p50`];
        filteredEntry[`${variable}_p90`] = entry[`${variable}_p90`];
      });

      return filteredEntry;
    });

    result[key] = processedData;
  });

  return result;
};

export const getPrograms = async (): Promise<ProgramResponse | null> => {
  try {
    const response = await api.get<ProgramResponse>("/programs", {
      responseType: "json",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching programs:", error);
    return null;
  }
};

export const getPkGeom = async (
  program: string,
  obj_ord_pk: string
): Promise<GeoJsonResponse | null> => {
  try {
    const response = await api.get<GeoJsonResponse>(
      `/pk_geom/${program}/${obj_ord_pk}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching PK geometry:", error);
    return null;
  }
};

export const getStationSnap = async (
  program: string
): Promise<GeoJsonResponse | null> => {
  try {
    const response = await api.get<GeoJsonResponse>(`/stationsnap/${program}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching station snap:", error);
    return null;
  }
};

export const getStationSnapSld = async (program: string): Promise<Blob | null> => {
  return getSld(`/sld/stationsnap/${program}`);
};

export const getFullData = async (
  request: DataRequestFull
): Promise<DataResponse | null> => {
  try {
    const response = await api.post<DataResponse>("/fulldata", request);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};


export const streamHydroData = async (program: string, setHydroData: React.Dispatch<React.SetStateAction<GeoJsonResponse | null>>) => {
  try {
      const response = await fetch(`/api/hydro/${program}`);
      if (!response.body) {
          console.error("Pas de corps de réponse.");
          return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let features: GeoJsonFeature[] = [];
      setHydroData({ type: "FeatureCollection", name: "Hydrographie", crs: { type: "name", properties: { name: "urn:ogc:def:crs:EPSG::4326" } }, features: [] });
      while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          accumulatedText += decoder.decode(value, { stream: true });
          const jsonParts = accumulatedText.split("},{").map((s, i, arr) => {
              if (i === 0) return s + "}";
              if (i === arr.length - 1) return "{" + s;
              return "{" + s + "}";
          });
          jsonParts.forEach((part) => {
              try {
                  const parsedFeature = JSON.parse(part);
                  features.push(parsedFeature);
                  setHydroData(prevData => prevData ? { ...prevData, features: [...prevData.features, parsedFeature] } : null);
              } catch (e) {
                  // JSON partiel, on attend plus de données
              }
          });
          accumulatedText = jsonParts[jsonParts.length - 1]; // Garde la dernière partie pour le prochain batch
      }
  } catch (error) {
      console.error("Erreur lors du streaming des données Hydro :", error);
  }
};


export const streamPkData = async (program: string, setPkData: React.Dispatch<React.SetStateAction<GeoJsonResponse | null>>) => {
  try {
      const response = await fetch(`/api/pk/${program}`);
      if (!response.body) {
          console.error("Pas de corps de réponse.");
          return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let features: GeoJsonFeature[] = [];
      setPkData({ type: "FeatureCollection", name: "Hydrographie", crs: { type: "name", properties: { name: "urn:ogc:def:crs:EPSG::4326" } }, features: [] });
      while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          accumulatedText += decoder.decode(value, { stream: true });
          const jsonParts = accumulatedText.split("},{").map((s, i, arr) => {
              if (i === 0) return s + "}";
              if (i === arr.length - 1) return "{" + s;
              return "{" + s + "}";
          });
          jsonParts.forEach((part) => {
              try {
                  const parsedFeature = JSON.parse(part);
                  features.push(parsedFeature);
                  setPkData(prevData => prevData ? { ...prevData, features: [...prevData.features, parsedFeature] } : null);
              } catch (e) {
                  // JSON partiel, on attend plus de données
              }
          });
          accumulatedText = jsonParts[jsonParts.length - 1]; // Garde la dernière partie pour le prochain batch
      }
  } catch (error) {
      console.error("Erreur lors du streaming des données Hydro :", error);
  }
};


export const getColoredMapData = async (request: ColorMapRequest): Promise<ColoredMapResponseData | null> => {
  try {
    const response = await api.post<ColoredMapResponseData>("/dataprofil/formap", request);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const getVariableSld = async (variable: string): Promise<Blob | null> => {
  return getSld(`/sld/variable/${variable}`);
};

export const getProfileFullData = async (
  request: ColorMapRequest
): Promise<ProfileGraphDataResponse | null> => {
  try {
    const response = await api.post<ProfileGraphDataResponse>("/dataprofil/fulldata", request);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const getProfileData = async (
  request: ProfileGraphPkRequest
): Promise<ProfileGraphDataResponse | null> => {
  try {
    const response = await api.post<ProfileGraphDataResponse>("/dataprofil/data", request);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
