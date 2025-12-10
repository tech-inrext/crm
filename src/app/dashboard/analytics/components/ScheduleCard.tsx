import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.25}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 600, color: '#222' }}>Schedule In this Week</Typography>
            <a href="/dashboard/leads" style={{ color: '#0792fa', fontWeight: 500, fontSize: '1rem', textDecoration: 'none' }}>View All</a>
          </Box>
          <Box>
            {scheduleLoading && (
              <Typography sx={{ color: '#666', textAlign: 'center', py: 2.5 }}>Loading schedule...</Typography>
            )}
            {!scheduleLoading && scheduleAnalytics && scheduleAnalytics.success && (
              <Box>
                <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
                  <Box sx={{
                    background: '#e3f2fd',
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#1976d2'
                  }}>
                    {scheduleAnalytics.totalScheduled} scheduled this Months
                  </Box>
                  {scheduleAnalytics.overdueCount && scheduleAnalytics.overdueCount > 0 && (
                    <Box sx={{
                      background: '#ffebee',
                      px: 1.5,
                      py: 1,
                      borderRadius: 1.5,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#d32f2f'
                    }}>
                      {scheduleAnalytics.overdueCount} overdue
                    </Box>
                  )}
                </Box>
                <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
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
                        <Box key={lead.id} display="flex" alignItems="center" p={1.5} mb={1} sx={{ background: isToday ? '#fff3e0' : '#f8f9fa', borderRadius: 2, border: isToday ? '1px solid #ffcc02' : '1px solid #e9ecef', cursor: 'pointer' }}>
                          <Box flex={1}>
                            <Typography sx={{ fontWeight: 600, color: '#222', fontSize: '0.95rem', mb: 0.25 }}>{lead.fullName || 'Unknown'}</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#666', mb: 0.5 }}>{lead.phone} • {lead.source || 'No source'}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>{lead.assignedTo ? `Assigned to: ${lead.assignedTo.name}` : 'Unassigned'}</Typography>
                          </Box>
                          <Box textAlign="right" minWidth={80}>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: isToday ? '#f57c00' : '#666', mb: 0.25 }}>{dateLabel}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>{followUpDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</Typography>
                            <Box sx={{
                              fontSize: '0.7rem',
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              background: lead.status === 'New' ? '#e3f2fd' :
                                lead.status === 'Contacted' ? '#e8f5e9' :
                                  lead.status === 'Site Visit' ? '#fff3e0' : '#f3e5f5',
                              color: lead.status === 'New' ? '#1976d2' :
                                lead.status === 'Contacted' ? '#388e3c' :
                                  lead.status === 'Site Visit' ? '#f57c00' : '#7b1fa2',
                              mt: 0.5
                            }}>{lead.status}</Box>
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ color: '#666', textAlign: 'center', py: 5, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                      📅 No follow-ups scheduled for this week
                    </Box>
                  )}
                  {scheduleAnalytics.leads && scheduleAnalytics.leads.length > 8 && (
                    <Typography sx={{ textAlign: 'center', py: 1, color: '#666', fontSize: '0.85rem' }}>
                      +{scheduleAnalytics.leads.length - 8} more follow-ups this week
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
            {!scheduleLoading && (!scheduleAnalytics || !scheduleAnalytics.success) && (
              <Box sx={{ color: '#d32f2f', textAlign: 'center', py: 2.5, background: '#ffebee', borderRadius: 2, border: '1px solid #ffcdd2' }}>
                Failed to load schedule data
              </Box>
            )}
          </Box>
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
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 600, color: '#6c757d', mb: 1 }}>
          🔒 Access Restricted
        </Typography>
        <Typography sx={{ color: '#6c757d', mb: 2 }}>
          You don't have permission to view Schedule This Week.
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: '#868e96' }}>
          Contact your administrator to enable this access.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
