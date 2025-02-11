import axios from "axios";

const api = axios.create({
  baseURL: "/api", //dev env http://127.0.0.1:8000
  headers: {
    "Content-Type": "application/json",
  },
});

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

export interface DataRequest {
  program: string;
  scenarios: number[];
  variables: string[];
  pk: Pk[];
}

export interface Program {
  name: string;
  title: string;
  description: string;
  variables: string[];
  exutoire_id: number;
  background: string;
}

export interface ProgramResponse {
  programs?: Program[];
}

export interface AmontAvalResponse {
  id_hyd: number[];
  pk: Pk[];
}

export interface DataRequest {
  program: string;
  scenarios: number[];
  variables: string[];
  pk: Pk[];
}

export interface DataRequestFull {
  program: string;
  scenarios: number[];
  variables: string[];
}

export interface Space3DataRequest{
  program: string;
  scenarios: number[];
  variables: string[];
  decades: number[];
}

export interface DataPoint {
  decade: number;
  [variable: string]: number;
}

export interface DataResponse {
  [key: string]: { data: DataPoint[] };
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

export interface Scenario {
  id: number;
  code: string;
  description: string;
  year: number;
}

export interface ScenarioResponse {
  scenarios: Scenario[];
}

export const getScenarios = async (): Promise<ScenarioResponse | null> => {
  try {
    const response = await api.get<ScenarioResponse>("/scenarios");
    return response.data;
  } catch (error) {
    console.error("Error fetching scenarios:", error);
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
  try {
    const response = await api.get<Blob>(`/sld/hydro/${program}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Hydro SLD:", error);
    return null;
  }
};

// Récupérer le fichier SLD pour Bassin
export const getBassinSLD = async (program: string): Promise<Blob | null> => {
  try {
    const response = await api.get<Blob>(`/sld/bassin/${program}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bassin SLD:", error);
    return null;
  }
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

export const getStationSnapSld = async (
  program: string
): Promise<Blob | null> => {
  try {
    const response = await api.get<Blob>(`/sld/stationsnap/${program}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching station snap SLD:", error);
    return null;
  }
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

export const getSpace3Data = async (
  request: Space3DataRequest | null
): Promise<GeoJsonResponse | null> => {
  try{
    const response = await api.post<GeoJsonResponse>("/dataspace3", request);
    return response.data;
  }catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}