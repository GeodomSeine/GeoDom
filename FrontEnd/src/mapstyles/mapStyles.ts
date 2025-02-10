// Fonction pour traduire le SLD en styles dynamiques
export const parseSLDToStyles = (sldText: string): any[] => {
  const styles: any[] = [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(sldText, 'application/xml');
  
  const rules = xmlDoc.getElementsByTagName('se:Rule');
  
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const filters = rule.getElementsByTagName('ogc:And')[0];
    
    let min = 0;
    let max = Infinity;
    
    if (filters) {
      const greaterThanOrEqual = filters.getElementsByTagName('ogc:PropertyIsGreaterThanOrEqualTo')[0];
      const lessThanOrEqual = filters.getElementsByTagName('ogc:PropertyIsLessThanOrEqualTo')[0];
      
      if (greaterThanOrEqual) {
        min = parseFloat(greaterThanOrEqual.getElementsByTagName('ogc:Literal')[0]?.textContent || '0');
      }
      if (lessThanOrEqual) {
        max = parseFloat(lessThanOrEqual.getElementsByTagName('ogc:Literal')[0]?.textContent || 'Infinity');
      }
    }
    
    const strokeParams = rule.getElementsByTagName('se:SvgParameter');
    let color = '#000000';
    let weight = 1;
    
    for (let j = 0; j < strokeParams.length; j++) {
      const param = strokeParams[j];
      const name = param.getAttribute('name');
      if (name === 'stroke') color = param.textContent || '#000000';
      if (name === 'stroke-width') weight = parseFloat(param.textContent || '1');
    }
    
    styles.push({ min, max, color, weight });
  }
  
  return styles;
};