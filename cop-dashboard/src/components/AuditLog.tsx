import React from 'react';
import { AuditLog } from '../services/api';
import { Shield, Eye, Edit, Trash2, Clock } from 'lucide-react';

interface AuditLogProps {
  logs: AuditLog[];
}

export default function AuditLog({ logs }: AuditLogProps) {
  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getActionIcon = (action: string): React.ReactNode => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'add':
        return <Shield size={14} className="action-icon create" />;
      case 'update':
      case 'verify':
      case 'edit':
        return <Edit size={14} className="action-icon update" />;
      case 'delete':
      case 'remove':
      case 'recover':
        return <Trash2 size={14} className="action-icon delete" />;
      default:
        return <Eye size={14} className="action-icon view" />;
    }
  };

  return (
    <div className="audit-log-container">
      <div className="audit-header">
        <Shield size={20} className="audit-icon" />
        <h3>Audit Trail</h3>
      </div>

      <div className="audit-list">
        {logs.length === 0 ? (
          <div className="empty-audit">
            <Clock size={24} />
            <p>No audit logs yet</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="audit-entry">
              <div className="audit-icon-wrapper">
                {getActionIcon(log.action)}
              </div>
              <div className="audit-content">
                <div className="audit-action">
                  <strong>{log.actorId.slice(0, 8)}...</strong>
                  {' '}{log.action}{' '}
                  <span className="action-target">{log.targetEntity}</span>
                </div>
                <div className="audit-meta">
                  <Clock size={12} />
                  <span>{formatTime(log.timestamp)}</span>
                  <span className="audit-ip">{log.ipAddress}</span>
                </div>
              </div>
              <span className={`audit-role badge-${log.role.toLowerCase()}`}>
                {log.role}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
