import React from 'react';

interface EditorProps {
  config: any;
  onChange: (newConfig: any) => void;
}

export const ConfigEditor = ({ config, onChange }: EditorProps) => (
  <div className="config-editor">
    {/* 实现具体编辑逻辑 */}
  </div>
); 