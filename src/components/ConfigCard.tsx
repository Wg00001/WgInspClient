import React, { useState } from 'react';
import { wsClient } from '../services/wsClient';
import { BaseConfig } from '../types/config';
import { ConfigEditor } from './ConfigEditor';

const ConfigCard = ({ config }: { config: BaseConfig }) => {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(config);
  
  const handleSave = () => {
    wsClient.send({
      action: 'config_save',
      config_type: config.type,
      config_data: draft
    });
    setEditMode(false);
  };

  const handleDelete = () => {
    // Implement the delete logic
  };

  return (
    <div className="config-card">
      {editMode ? (
        <ConfigEditor config={draft} onChange={setDraft} />
      ) : (
        <>
          <h3>{config.Identity}</h3>
          <button onClick={() => setEditMode(true)}>编辑</button>
          <button onClick={handleDelete}>删除</button>
        </>
      )}
      <button onClick={handleSave}>保存</button>
    </div>
  );
};

export default ConfigCard; 