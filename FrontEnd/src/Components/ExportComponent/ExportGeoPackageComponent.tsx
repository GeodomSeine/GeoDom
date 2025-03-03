import React from 'react';
import { getExportHydroData } from '../../services/api';
import ButtonComponent from '../SimpleComponents/ButtonComponent';

interface HydroExportComponentProps {
  program: string;
}

const ExportGeoPackageComponent: React.FC<HydroExportComponentProps> = ({ program }) => {
  const handleDownload = async () => {
    const blob = await getExportHydroData(program);
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${program}.zip`;
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