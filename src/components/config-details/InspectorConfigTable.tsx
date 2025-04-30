import React, { useState } from 'react';
import { InspectorConfig } from '../../types/config';
import InspectorConfigRow from './InspectorConfigDetail';
import ConfigEditForm from '../ConfigEditForm';

interface InspectorConfigTableProps {
  data: InspectorConfig[];
  onEdit: (config: InspectorConfig) => void;
  onDelete: (id: number) => void;
  onCreate?: (parent: InspectorConfig) => void;
}

interface RowState {
  expanded: boolean;
  editing: boolean;
}

const InspectorConfigTable: React.FC<InspectorConfigTableProps> = ({ data, onEdit, onDelete, onCreate }) => {
  // 用于记录每个节点的展开/编辑状态
  const [rowStates, setRowStates] = useState<Record<number, RowState>>({});

  // 递归渲染树形结构
  const renderRows = (nodes: InspectorConfig[], level = 0) => {
    return nodes.map((node) => {
      const state = rowStates[node.ID] || { expanded: false, editing: false };
      const hasChildren = node.Children && node.Children.length > 0;
      const canDelete = !hasChildren;
      const canEdit = true;
      return [
        state.editing ? (
          <tr key={`edit-${node.ID}`}>
            <td colSpan={6} style={{ paddingLeft: 40 * (level + 1) }}>
              <ConfigEditForm
                config={node}
                onCancel={() => setRowStates(s => ({ ...s, [node.ID]: { ...state, editing: false } }))}
                onSave={(updated) => {
                  onEdit(updated);
                  setRowStates(s => ({ ...s, [node.ID]: { ...state, editing: false } }));
                }}
                type="inspector_config"
              />
            </td>
          </tr>
        ) : (
          <InspectorConfigRow
            key={node.ID}
            config={node}
            canEdit={canEdit}
            canDelete={canDelete}
            hasChildren={hasChildren}
            expanded={state.expanded}
            onEdit={() => setRowStates(s => ({ ...s, [node.ID]: { ...state, editing: true } }))}
            onDelete={canDelete ? () => onDelete(node.ID) : undefined}
            onExpand={() => setRowStates(s => ({ ...s, [node.ID]: { ...state, expanded: true } }))}
            onCollapse={() => setRowStates(s => ({ ...s, [node.ID]: { ...state, expanded: false } }))}
            onCreate={onCreate}
            tdClassName={{
              SQL: 'cell-wrap-content',
              Condition: 'cell-wrap-content'
            }}
          />
        ),
        hasChildren && state.expanded
          ? renderRows(node.Children!, level + 1)
          : null
      ];
    });
  };

  return (
    <table className="inspector-config-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ width: 40 }}></th>
          <th>名称</th>
          <th>SQL</th>
          <th>告警条件</th>
          <th>编辑</th>
          <th>创建</th>
        </tr>
      </thead>
      <tbody>{renderRows(data)}</tbody>
    </table>
  );
};

export default InspectorConfigTable; 