import React, { useMemo } from 'react';
import { BaseConfig } from '../types/config';

const VersionDiff = ({ oldVer, newVer }: { 
  oldVer: BaseConfig;
  newVer: BaseConfig;
}) => {
  const diffs = useMemo(() => {
    return Object.keys(newVer).map(key => ({
      field: key,
      old: oldVer[key],
      new: newVer[key]
    })).filter(d => d.old !== d.new);
  }, [oldVer, newVer]);

  return (
    <div className="version-diff">
      {diffs.map(d => (
        <div key={d.field} className="diff-item">
          <span className="field">{d.field}</span>
          <div className="values">
            <del>{d.old}</del>
            <ins>{d.new}</ins>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VersionDiff; 