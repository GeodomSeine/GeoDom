import React from 'react';
import { getExportGeopackage } from '../../services/api';
import ButtonComponent from '../SimpleComponents/ButtonComponent';
import {BeatLoader} from 'react-spinners';

import { getColor } from "../../utils/mapUtils";

interface HydroExportComponentProps {
  request: {
    program: string,
    scenarios: number[],
    variables: string[],
    decades: number[],
    percentile: "p5" | "p50" | "p90"
  }
}

const ExportGeoPackageComponent: React.FC<HydroExportComponentProps> = ({ request }) => {

  const [isLoading, setIsLoading] = React.useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    const blob = await getExportGeopackage(request);
    setIsLoading(false);

    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${request.program}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      console.error("Failed to download the file.");
    }
  };

  return (
    <>
      {isLoading && 
        <BeatLoader
          color={getColor("--primary-blue")}
        />
      }

      {!isLoading &&
        <ButtonComponent
            onClick={handleDownload}
            txt='GeoPackage'
            className='button_container'
        />
      }
    </>
  );
};

export default ExportGeoPackageComponent;