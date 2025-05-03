import React, { useState, useEffect } from 'react';
import { wsClient } from '../services/wsClient';
import { Notice, NoticeConfirmStatus } from '../types/notice';
import '../styles/Notifications.css';

const Notifications: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pageSize = 10;

  // 关闭错误提示框
  const closeErrorModal = () => {
    setErrorMessage(null);
  };

  useEffect(() => {
    // 请求通知数据
    fetchNotices(currentPage);

    // 监听通知数据响应
    const handleNoticeResponse = (response: any) => {
      setLoading(false);
      if (response.success) {
        if (response.config_data && Array.isArray(response.config_data)) {
          setNotices(response.config_data);
          // 假设总页数为当前通知数量除以每页数量向上取整
          // 实际应用中应该从服务端获取总数
          setTotalPages(Math.ceil(response.config_data.length / pageSize) || 1);
        } else {
          setNotices([]);
        }
        setError(null);
      } else {
        setError(response.message || '获取通知失败');
      }
    };

    // 订阅通知响应
    wsClient.subscribe('notice_get', handleNoticeResponse);
    wsClient.subscribe('notice_confirm', (response: any) => {
      if (response.success) {
        fetchNotices(currentPage);
      } else {
        // 显示错误消息
        setErrorMessage(response.message || '通知确认失败');
      }
    });

    return () => {
      wsClient.unsubscribe('notice_get');
      wsClient.unsubscribe('notice_confirm');
    };
  }, [currentPage]);

  const fetchNotices = (page: number) => {
    setLoading(true);
    wsClient.getNotices(page, pageSize);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    
    // 如果通知状态为未读，则标记为已读
    if (notice.ConfirmStat === 'Unread') {
      wsClient.confirmNotice(notice, 'Read');
      
      // 在本地更新状态，使UI立即响应，但最终结果将取决于服务器响应
      setNotices(prevNotices => 
        prevNotices.map(n => 
          n.ID === notice.ID ? { ...n, ConfirmStat: 'Read' } : n
        )
      );
    }
  };

  const handleConfirm = (notice: Notice, status: NoticeConfirmStatus) => {
    wsClient.confirmNotice(notice, status);
    
    // 不再在本地立即更新状态，而是等待服务器的响应
    setSelectedNotice(null);
  };

  const formatTimeString = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN');
    } catch (e) {
      return timeString;
    }
  };

  // 截取过长的内容
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 将文本中的换行符转换为 HTML 的换行
  const formatContentWithLineBreaks = (content: string) => {
    return content.split('\n').map((text, index) => (
      <React.Fragment key={index}>
        {text}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const renderStatusText = (status: NoticeConfirmStatus) => {
    switch (status) {
      case 'Unread':
        return <span className="status-badge unread">未读</span>;
      case 'Read':
        return <span className="status-badge read">已读</span>;
      case 'UnConfirm':
        return <span className="status-badge unconfirm">待确认</span>;
      case 'Allow':
        return <span className="status-badge allow">已接受</span>;
      case 'NotAllow':
        return <span className="status-badge not-allow">已拒绝</span>;
      default:
        return null;
    }
  };

  return (
    <div className="notifications-container">
      {errorMessage && (
        <div className="error-modal">
          <div className="error-modal-content">
            <h3 className="error-title">操作失败</h3>
            <p className="error-message">{errorMessage}</p>
            <button 
              onClick={closeErrorModal} 
              className="error-close-button"
            >
              关闭
            </button>
          </div>
        </div>
      )}
      
      <div className="notifications-header">
        <h2>通知中心</h2>
        <button 
          onClick={() => fetchNotices(currentPage)}
          className="btn-refresh"
        >
          刷新
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">加载中...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : notices.length === 0 ? (
        <div className="empty-content">暂无通知</div>
      ) : (
        <>
          <div className="notifications-list">
            {notices.map(notice => (
              <div 
                key={notice.ID} 
                className={`notification-item ${notice.ConfirmStat === 'Unread' ? 'unread' : ''}`}
                onClick={() => handleNoticeClick(notice)}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <div className="notification-time">{formatTimeString(notice.Time)}</div>
                    {renderStatusText(notice.ConfirmStat)}
                  </div>
                  <div className="notification-message">{truncateContent(notice.Content)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-button"
            >
              上一页
            </button>
            <span className="page-info">第 {currentPage} 页 / 共 {totalPages} 页</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-button"
            >
              下一页
            </button>
          </div>
        </>
      )}

      {selectedNotice && (
        <>
          {/* <div className="modal-overlay" onClick={() => setSelectedNotice(null)}></div> */}
          <div className="notice-detail-modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <h3>通知详情</h3>
                <button className="close-button" onClick={() => setSelectedNotice(null)}>×</button>
              </div>
              <div className="modal-body">
                <div className="notice-time">{formatTimeString(selectedNotice.Time)}</div>
                <div className="notice-content">{formatContentWithLineBreaks(selectedNotice.Content)}</div>
                <div className="notice-status">
                  状态: {renderStatusText(selectedNotice.ConfirmStat)}
                </div>
              </div>
              {selectedNotice.ConfirmStat === 'UnConfirm' && (
                <div className="modal-actions">
                  <button 
                    className="btn-reject"
                    onClick={() => handleConfirm(selectedNotice, 'NotAllow')}
                  >
                    拒绝
                  </button>
                  <button 
                    className="btn-accept"
                    onClick={() => handleConfirm(selectedNotice, 'Allow')}
                  >
                    接受
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications; 