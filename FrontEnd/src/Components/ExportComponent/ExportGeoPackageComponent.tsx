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
    <div className="export_container json">
            <div className='export_body'>
                <ButtonComponent
                    onClick={handleDownload}
                    txt='Les données en GeoPackage'
                    className='button_container'
                />
            </div>
    </div>
  );
};

export default ExportGeoPackageComponent;