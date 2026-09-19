import React from 'react';
import { HotlistEntry } from '../services/api';
import { Clock, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface HotlistTableProps {
  entries: HotlistEntry[];
  onViewTrail: (entry: HotlistEntry) => void;
  onVerifyFir: (entry: HotlistEntry) => void;
  onMarkRecovered: (entry: HotlistEntry) => void;
}

export default function HotlistTable({ entries, onViewTrail, onVerifyFir, onMarkRecovered }: HotlistTableProps) {
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string): { label: string; className: string } => {
    switch (status) {
      case 'ACTIVE_UNCONFIRMED':
        return { label: 'Pending FIR', className: 'status-pending' };
      case 'ACTIVE_CONFIRMED':
        return { label: 'FIR Verified', className: 'status-verified' };
      case 'EXPIRED':
        return { label: 'Expired', className: 'status-expired' };
      case 'RECOVERED':
        return { label: 'Recovered', className: 'status-recovered' };
      default:
        return { label: status, className: 'status-unknown' };
    }
  };

  const isUrgent = (entry: HotlistEntry): boolean => {
    if (entry.status !== 'ACTIVE_UNCONFIRMED' || !entry.firDeadline) return false;
    const deadline = new Date(entry.firDeadline);
    const now = new Date();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursLeft < 6;
  };

  return (
    <div className="hotlist-table-container">
      <table className="hotlist-table">
        <thead>
          <tr>
            <th>Plate Number</th>
            <th>Status</th>
            <th>Added Date</th>
            <th>FIR Deadline</th>
            <th>Last Seen</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const statusInfo = getStatusBadge(entry.status);
            const urgent = isUrgent(entry);

            return (
              <tr key={entry.id} className={urgent ? 'row-urgent' : ''}>
                <td className="plate-cell">
                  <div className="plate-number">{entry.plateNumber}</div>
                  {entry.firReferenceNo && (
                    <div className="fir-number">FIR: {entry.firReferenceNo}</div>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </td>
                <td>{formatDate(entry.addedAt)}</td>
                <td>
                  {entry.firDeadline ? (
                    <div className={`deadline-cell ${urgent ? 'deadline-urgent' : ''}`}>
                      <Clock size={14} />
                      <span>{formatDate(entry.firDeadline)}</span>
                      {urgent && <AlertTriangle size={14} className="urgent-icon" />}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {entry.lastSeenLat ? (
                    <div className="location-cell">
                      <MapPin size={14} />
                      <span>{entry.lastSeenLat}, {entry.lastSeenLng}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="actions-cell">
                  {entry.status === 'ACTIVE_UNCONFIRMED' && (
                    <button
                      className="action-btn verify-btn"
                      onClick={() => onVerifyFir(entry)}
                      title="Verify FIR"
                    >
                      <CheckCircle size={16} />
                      Verify FIR
                    </button>
                  )}
                  {(entry.status === 'ACTIVE_UNCONFIRMED' || entry.status === 'ACTIVE_CONFIRMED') && (
                    <button
                      className="action-btn recovered-btn"
                      onClick={() => onMarkRecovered(entry)}
                      title="Mark Recovered"
                    >
                      <XCircle size={16} />
                      Mark Recovered
                    </button>
                  )}
                  {entry.lastSeenLat && (
                    <button
                      className="action-btn trail-btn"
                      onClick={() => onViewTrail(entry)}
                      title="View Trail"
                    >
                      <MapPin size={16} />
                      View Trail
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {entries.length === 0 && (
        <div className="empty-state">
          <CheckCircle size={48} className="empty-icon" />
          <p>No vehicles on hotlist</p>
        </div>
      )}
    </div>
  );
}
