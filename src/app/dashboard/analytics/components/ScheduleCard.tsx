import React from 'react';
import { Card, CardContent } from '@/components/ui/Component';

interface AnalyticsAccess {
  showScheduleThisWeek: boolean;
}

interface ScheduleAnalytics {
  success?: boolean;
  totalScheduled?: number;
  overdueCount?: number;
  leads?: any[];
}

interface ScheduleCardProps {
  analyticsAccess: AnalyticsAccess;
  scheduleLoading: boolean;
  scheduleAnalytics: ScheduleAnalytics | null;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ analyticsAccess, scheduleLoading, scheduleAnalytics }) => {
  if (analyticsAccess.showScheduleThisWeek) {
    return (
      <Card
        sx={{
          minHeight: 400,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          width: { xs: '100%', md: '175%' },
          mr: { xs: 0, md: 1 }
        }}
      >
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 600, color: '#222' }}>Schedule In this Week</span>
            <a href="/dashboard/leads" style={{ color: '#0792fa', fontWeight: 500, fontSize: '1rem', textDecoration: 'none' }}>View All</a>
          </div>
          <div>
            {scheduleLoading && (
              <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Loading schedule...</div>
            )}
            {!scheduleLoading && scheduleAnalytics && scheduleAnalytics.success && (
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{
                    background: '#e3f2fd',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#1976d2'
                  }}>
                    {scheduleAnalytics.totalScheduled} scheduled this Months
                  </div>
                  {scheduleAnalytics.overdueCount && scheduleAnalytics.overdueCount > 0 && (
                    <div style={{
                      background: '#ffebee',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#d32f2f'
                    }}>
                      {scheduleAnalytics.overdueCount} overdue
                    </div>
                  )}
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {scheduleAnalytics.leads && scheduleAnalytics.leads.length > 0 ? (
                    scheduleAnalytics.leads.slice(0, 8).map((lead: any, index: number) => {
                      const followUpDate = new Date(lead.nextFollowUp);
                      const isToday = followUpDate.toDateString() === new Date().toDateString();
                      const isTomorrow = followUpDate.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
                      let dateLabel = followUpDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      });
                      if (isToday) dateLabel = 'Today';
                      else if (isTomorrow) dateLabel = 'Tomorrow';
                      return (
                        <div key={lead.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          marginBottom: '8px',
                          background: isToday ? '#fff3e0' : '#f8f9fa',
                          borderRadius: '8px',
                          border: isToday ? '1px solid #ffcc02' : '1px solid #e9ecef',
                          cursor: 'pointer'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#222', fontSize: '0.95rem', marginBottom: '2px' }}>
                              {lead.fullName || 'Unknown'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                              {lead.phone} • {lead.source || 'No source'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>
                              {lead.assignedTo ? `Assigned to: ${lead.assignedTo.name}` : 'Unassigned'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '80px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isToday ? '#f57c00' : '#666', marginBottom: '2px' }}>
                              {dateLabel}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>
                              {followUpDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                            <div style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: lead.status === 'New' ? '#e3f2fd' :
                                lead.status === 'Contacted' ? '#e8f5e9' :
                                  lead.status === 'Site Visit' ? '#fff3e0' : '#f3e5f5',
                              color: lead.status === 'New' ? '#1976d2' :
                                lead.status === 'Contacted' ? '#388e3c' :
                                  lead.status === 'Site Visit' ? '#f57c00' : '#7b1fa2',
                              marginTop: '4px'
                            }}>
                              {lead.status}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{
                      color: '#666',
                      textAlign: 'center',
                      padding: '40px 20px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      📅 No follow-ups scheduled for this week
                    </div>
                  )}
                  {scheduleAnalytics.leads && scheduleAnalytics.leads.length > 8 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      color: '#666',
                      fontSize: '0.85rem'
                    }}>
                      +{scheduleAnalytics.leads.length - 8} more follow-ups this week
                    </div>
                  )}
                </div>
              </div>
            )}
            {!scheduleLoading && (!scheduleAnalytics || !scheduleAnalytics.success) && (
              <div style={{
                color: '#d32f2f',
                textAlign: 'center',
                padding: '20px',
                background: '#ffebee',
                borderRadius: '8px',
                border: '1px solid #ffcdd2'
              }}>
                Failed to load schedule data
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  // If access is restricted
  return (
    <Card
      sx={{
        minHeight: 320,
        height: '95%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '175%',
        mr: 1,
        background: '#f8f9fa',
        border: '1px solid #dee2e6'
      }}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#6c757d', marginBottom: 8 }}>
          🔒 Access Restricted
        </div>
        <div style={{ color: '#6c757d', marginBottom: 16 }}>
          You don't have permission to view Schedule This Week.
        </div>
        <div style={{ fontSize: '0.9rem', color: '#868e96' }}>
          Contact your administrator to enable this access.
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
