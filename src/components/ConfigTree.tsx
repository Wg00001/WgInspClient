import React, { useState, useEffect } from 'react';
import { wsClient } from '../services/wsClient';
import { ConfigIndex, ConfigIndexItem, ConfigType } from '../types/config';

interface TreeNode {
  identity: string;
  type: ConfigType;
  children?: TreeNode[];
}

const ConfigTree = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleError = (error: any) => {
      console.error('ConfigTree error:', error);
      setError('加载配置失败，请检查网络连接');
      setIsLoading(false);
    };

    wsClient.subscribe<ConfigIndex>('ConfigIndex', (index) => {
      try {
        const buildTree = (items: ConfigIndexItem[]): TreeNode[] => {
          // 创建节点映射
          const nodeMap = new Map<string, TreeNode>();
          
          // 首先创建所有节点
          items.forEach(item => {
            nodeMap.set(item.identity, {
              identity: item.identity,
              type: item.type,
              children: []
            });
          });
          
          // 构建树结构
          const roots: TreeNode[] = [];
          items.forEach(item => {
            const node = nodeMap.get(item.identity)!;
            if (item.parent) {
              const parent = nodeMap.get(item.parent);
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(node);
              }
            } else {
              roots.push(node);
            }
          });
          
          return roots;
        };
        
        setTreeData(buildTree(index));
        setError(null);
      } catch (err) {
        handleError(err);
      }
      setIsLoading(false);
    });
    
    wsClient.send({ action: 'config_get', config_type: 'Index' });
  }, []);

  if (isLoading) {
    return <div className="config-tree">加载中...</div>;
  }

  if (error) {
    return <div className="config-tree error">{error}</div>;
  }

  return (
    <div className="config-tree">
      {treeData.length === 0 ? (
        <div>暂无配置数据</div>
      ) : (
        treeData.map(node => (
          <TreeNodeComponent key={node.identity} node={node} />
        ))
      )}
    </div>
  );
};

const TreeNodeComponent = ({ node }: { node: TreeNode }) => (
  <div className="tree-node">
    <span>{node.identity}</span>
    {node.children?.map(child => (
      <TreeNodeComponent key={child.identity} node={child} />
    ))}
  </div>
);

export default ConfigTree; 