import React from 'react';
import { getExportHydroData } from '../../services/api';
import ButtonComponent from '../SimpleComponents/ButtonComponent';

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
  const handleDownload = async () => {
    const blob = await getExportHydroData(request);
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
    <ButtonComponent
        onClick={handleDownload}
        txt='GeoPackage'
        className='button_container'
    />
  );
};

export default ExportGeoPackageComponent;