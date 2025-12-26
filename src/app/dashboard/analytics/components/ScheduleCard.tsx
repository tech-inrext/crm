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
          <Box display="flex" gap={1} alignItems="center" mb={2.25} flexWrap={{ xs: 'wrap', sm: 'wrap', md: 'nowrap' }}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 600, color: '#222', mb: { xs: 1, sm: 1, md: 0 } }}>Schedule In this </Typography>
            <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0} sx={{ flexWrap: { xs: 'wrap', sm: 'wrap', md: 'nowrap' } }}>
              <Select
                value={filter}
                onChange={e => setFilter(e.target.value as 'day' | 'week')}
                size="small"
                sx={{ minWidth: 140, width: 'auto', maxWidth: '100%' }}
                displayEmpty
              >
                <MenuItem value="day">Day Wise</MenuItem>
                <MenuItem value="week">Week Wise</MenuItem>
              </Select>
              <a
                href="/dashboard/leads"
                className="text-[#0792fa] font-medium text-base no-underline hover:underline"
                style={{ marginLeft: 0, whiteSpace: 'nowrap', ...(typeof window !== 'undefined' && window.innerWidth >= 900 ? { marginLeft: '10rem' } : {}) }}
              >
                View All
              </a>
            </Box>
          </Box>
          <Box>
            {scheduleLoading && (
              <Typography sx={{ color: '#666', textAlign: 'center', py: 2.5 }}>Loading schedule...</Typography>
            )}
            {!scheduleLoading && scheduleAnalytics && scheduleAnalytics.success && (
              <Box>
                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                  <Box sx={{ background: '#e3f2fd', px: 3, py: 2, borderRadius: 2, fontSize: '0.85rem', fontWeight: 600, color: '#1976d2' }}>
                    {scheduleAnalytics.totalScheduled} scheduled this Months
                  </Box>
                  <Box sx={{ background: '#ffebee', px: 3, py: 2, borderRadius: 2, fontSize: '0.85rem', fontWeight: 600, color: '#d32f2f' }}>
                    {scheduleAnalytics.overdueCount || 0} overdue
                  </Box>
                </Box>
                <Box sx={{ position: 'relative', height: 280, maxHeight: 280, overflowY: 'auto', pb: 7 }}>
                  {filteredLeads && filteredLeads.length > 0 && (
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
                              <div
                                className="text-[0.7rem] px-2 py-1 rounded mt-2"
                                style={{
                                  background: lead.status === 'New' ? '#e3f2fd'
                                    : lead.status === 'Contacted' ? '#e8f5e9'
                                    : lead.status === 'Site Visit' ? '#fff3e0'
                                    : '#f3e5f5',
                                  color: lead.status === 'New' ? '#1976d2'
                                    : lead.status === 'Contacted' ? '#388e3c'
                                    : lead.status === 'Site Visit' ? '#f57c00'
                                    : '#7b1fa2',
                                }}
                              >
                                {lead.status}
                              </div>
                            </Box>
                          </Box>
                        );
                      })}
                    </>
                  )}
                  {filteredLeads && filteredLeads.length === 0 && (
                    <Box sx={{ color: '#666', textAlign: 'center', py: 5, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                      📅 No follow-ups scheduled for this {filter === 'day' ? 'day' : 'week'}
                    </Box>
                  )}
                  {/* MUI Pagination Controls - fixed at bottom, always visible */}
                  <Box
                    className="flex items-center justify-center gap-5 absolute left-0 right-0 bottom-0 bg-white border-t border-[#eee] py-3 z-[2]"
                  >
                    <Typography className="text-[#666] text-[0.95rem]">Page</Typography>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handleChangePage}
                      color="primary"
                      size="small"
                    />
                    <Typography className="text-[#666] text-[0.95rem]">Rows:</Typography>
                    <Select
                      value={leadsPerPage}
                      onChange ={handleChangeRowsPerPage}
                      size="small"
                    >
                      <MenuItem value={2}>2</MenuItem>
                    </Select>
                  </Box>
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
