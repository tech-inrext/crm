import React from 'react';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Card from '@/components/ui/Component/Card';
import CardContent from '@/components/ui/Component/CardContent';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';

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
    const [filter, setFilter] = React.useState<'day' | 'week'>('week');
    const [page, setPage] = React.useState(1);
    const [leadsPerPage, setLeadsPerPage] = React.useState(2);
    // Filter leads based on filter selection
    let filteredLeads: any[] = [];
    if (scheduleAnalytics && scheduleAnalytics.leads) {
      if (filter === 'day') {
        const today = new Date();
        filteredLeads = scheduleAnalytics.leads.filter((lead: any) => {
          const followUpDate = new Date(lead.nextFollowUp);
          return followUpDate.toDateString() === today.toDateString();
        });
      } else {
        // Week: leads with nextFollowUp in this week (Mon-Sun)
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);
        filteredLeads = scheduleAnalytics.leads.filter((lead: any) => {
          const followUpDate = new Date(lead.nextFollowUp);
          return followUpDate >= startOfWeek && followUpDate <= endOfWeek;
        });
      }
    }
    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(filteredLeads.length / leadsPerPage));
    const paginatedLeads = filteredLeads.slice((page - 1) * leadsPerPage, page * leadsPerPage);
    React.useEffect(() => {
      setPage(1); // Reset to first page when filter or leadsPerPage changes
    }, [filter, scheduleAnalytics, leadsPerPage]);

    const handleChangePage = (_: any, value: number) => {
      setPage(value);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<{ value: unknown }>) => {
      setLeadsPerPage(Number(event.target.value));
      setPage(1);
    };
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
          <Box display="flex"  gap={1} alignItems="center" mb={2.25}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 600, color: '#222' }}>Schedule In this </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as 'day' | 'week')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontWeight: 500,
                  fontSize: '1rem',
                  color: '#222',
                  background: '#f7f9fa',
                  marginRight: 118
                }}
              >
                <option value="day">Day Wise</option>
                <option value="week">Week Wise</option>
              </select>
              <a href="/dashboard/leads" style={{ color: '#0792fa', fontWeight: 500, fontSize: '1rem',  textDecoration: 'none' }}>View All</a>
            </Box>
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
                <Box sx={{ position: 'relative', height: 280, maxHeight: 280, overflowY: 'auto', pb: 7 }}>
                  {filteredLeads && filteredLeads.length > 0 ? (
                    <>
                      {paginatedLeads.map((lead: any, index: number) => {
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
                      })}
                      {/* MUI Pagination Controls - fixed at bottom */}
                      <Box display="flex" alignItems="center" justifyContent="center" gap={2}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: '#fff',
                          borderTop: '1px solid #eee',
                          py: 1.5,
                          zIndex: 2
                        }}
                      >
                        <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>Page</Typography>
                        <Pagination
                          count={totalPages}
                          page={page}
                          onChange={handleChangePage}
                          color="primary"
                          size="small"
                          sx={{
                            '& .Mui-selected': {
                              backgroundColor: '#181c20',
                              color: '#fff',
                              borderRadius: '8px',
                            },
                            '& .MuiPaginationItem-root': {
                              minWidth: '32px',
                              height: '32px',
                              fontWeight: 600,
                            },
                          }}
                        />
                        <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>Rows:</Typography>
                        <Select
                          value={leadsPerPage}
                          onChange={handleChangeRowsPerPage}
                          size="small"
                          sx={{
                            background: '#181c20',
                            color: '#fff',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            '& .MuiSelect-icon': { color: '#fff' },
                            '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                            height: '32px',
                            pl: 1,
                            pr: 2,
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                background: '#181c20',
                                color: '#fff',
                                borderRadius: '8px',
                              },
                            },
                          }}
                        >
                          <MenuItem value={2}>2</MenuItem>
                        
                        </Select>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ color: '#666', textAlign: 'center', py: 5, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                      📅 No follow-ups scheduled for this {filter === 'day' ? 'day' : 'week'}
                    </Box>
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
