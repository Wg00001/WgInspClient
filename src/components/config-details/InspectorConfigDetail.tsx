import React, { useState } from 'react';
import { InspectorConfig } from '../../types/config';

interface InspectorConfigRowProps {
  config: InspectorConfig;
  onEdit: (config: InspectorConfig) => void;
  onCreate?: (parent: InspectorConfig) => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  tdClassName?: Record<string, string>;
  level?: number;
}

const MAX_CELL_LENGTH = 40;

const ellipsis = (str: string | undefined, max: number = MAX_CELL_LENGTH) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
};

const InspectorConfigRow: React.FC<InspectorConfigRowProps> = ({
  config,
  onEdit,
  onCreate,
  onDelete,
  canEdit = true,
  canDelete = true,
  hasChildren = false,
  expanded = false,
  onExpand,
  onCollapse,
  tdClassName,
  level = 0
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSQL, setEditSQL] = useState(config.SQL);
  const [editAlertWhen, setEditAlertWhen] = useState(config.AlertWhen || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // 编辑弹窗
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = () => {
    setEditSQL(config.SQL);
    setEditAlertWhen(config.AlertWhen || '');
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    onEdit({ ...config, SQL: editSQL, AlertWhen: editAlertWhen });
    setShowEditModal(false);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
  };

  const handleCreate = () => {
    if (onCreate) onCreate(config);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    if (onDelete) onDelete();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // 详情弹窗
  const handleShowDetail = () => setShowDetail(true);
  const handleCloseDetail = () => setShowDetail(false);

  // 为子节点创建缩进指示
  const renderIndent = () => {
    if (level === 0) return null;
    
    const indents = [];
    for (let i = 0; i < level; i++) {
      indents.push(<span key={i} className="child-node-line"></span>);
    }
    
    return (
      <span className="child-node-indent">
        {indents}
        <span className="child-node-indicator">
          {level === 1 ? "↳" : level === 2 ? "⤷" : "⟹"}
        </span>
      </span>
    );
  };

  return (
    <>
      <tr className={level > 0 ? `child-node-row child-node-level-${Math.min(level, 3)}` : ""}>
        <td style={{ textAlign: 'center', width: 40 }}>
          {hasChildren ? (
            <button
              className="btn-expand"
              onClick={expanded ? onCollapse : onExpand}
              style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label={expanded ? '收起' : '展开'}
            >
              {expanded ? '−' : '+'}
            </button>
          ) : null}
        </td>
        <td className="cell-ellipsis">
          {renderIndent()}
          {ellipsis(config.Name, 20)}
        </td>
        <td className={tdClassName?.SQL || "cell-ellipsis"}>{ellipsis(config.SQL)}</td>
        <td className={tdClassName?.Condition || "cell-ellipsis"}>{ellipsis(config.AlertWhen || '无')}</td>
        <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={handleShowDetail} className="btn-details">详情</button>
          <button onClick={handleEdit} className="btn-edit">编辑</button>
        </td>
        <td>
          <button onClick={handleCreate} className="btn-create">创建</button>
        </td>
      </tr>
      {/* 编辑弹窗 */}
      {showEditModal && (
        <tr>
          <td colSpan={6}>
            <div className="modal-overlay" style={{ zIndex: 2000 }}>
              <div className="modal-content" style={{ minWidth: 400 }}>
                <h3>编辑巡检配置</h3>
                <div className="form-group">
                  <label>SQL</label>
                  <textarea
                    value={editSQL}
                    onChange={e => setEditSQL(e.target.value)}
                    style={{ width: '100%', minHeight: 60 }}
                  />
                </div>
                <div className="form-group">
                  <label>告警条件</label>
                  <textarea
                    value={editAlertWhen}
                    onChange={e => setEditAlertWhen(e.target.value)}
                    style={{ width: '100%', minHeight: 40 }}
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleEditCancel} className="btn-cancel">取消</button>
                  <button onClick={handleEditSave} className="btn-edit">保存</button>
                  <button onClick={handleDelete} className="btn-delete">删除</button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
      {/* 详情弹窗 */}
      {showDetail && (
        <tr>
          <td colSpan={6}>
            <div className="modal-overlay" style={{ zIndex: 2000 }}>
              <div className="modal-content" style={{ minWidth: 400 }}>
                <h3>巡检配置详情</h3>
                <div className="form-group"><label>名称</label><div>{config.Name}</div></div>
                {level > 0 && config.Parent && (
                  <div className="form-group">
                    <label>父节点</label>
                    <div className="parent-node-info">{config.Parent.Name}</div>
                  </div>
                )}
                <div className="form-group"><label>SQL</label><div className="cell-wrap-content">{config.SQL}</div></div>
                <div className="form-group"><label>告警条件</label><div className="cell-wrap-content">{config.AlertWhen || '无'}</div></div>
                <div className="form-group"><label>子节点数量</label><div>{config.Children ? config.Children.length : 0}</div></div>
                <div className="modal-actions">
                  <button onClick={handleCloseDetail} className="btn-cancel">关闭</button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <tr>
          <td colSpan={6}>
            <div className="delete-confirm-modal" style={{ zIndex: 3000 }}>
              <div className="modal-content">
                <p>确定要删除此巡检配置吗？此操作不可恢复。</p>
                <div className="modal-actions">
                  <button onClick={cancelDelete} className="btn-cancel">取消</button>
                  <button onClick={confirmDelete} className="btn-confirm-delete">确认删除</button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default InspectorConfigRow;
