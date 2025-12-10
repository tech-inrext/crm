import React from 'react';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';
import FormControl from '@/components/ui/Component/FormControl';
import InputLabel from '@/components/ui/Component/InputLabel';
import Select from '@/components/ui/Component/Select';
import MenuItem from '@/components/ui/Component/MenuItem';
import Button from '@/components/ui/Component/Button';

export function VendorFilterControls({ tempFilters, setTempFilters, appliedFilters, avpUsers, avpLoading, avpError, handleSubmitFilters, handleResetFilters, monthOptions, generateYearOptions, hasUnappliedChanges }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
      gap={2}
      mb={2.5}
      p={2}
      sx={{ background: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6' }}
    >
      {/* Status Filter */}
      <FormControl fullWidth size="small">
        <InputLabel id="status-filter-label">Status Filter</InputLabel>
        <Select
          labelId="status-filter-label"
          value={tempFilters.status}
          label="Status Filter"
          onChange={e => setTempFilters({ ...tempFilters, status: e.target.value })}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="payment_due">Payment Due</MenuItem>
        </Select>
      </FormControl>
      {/* Month Filter */}
      <FormControl fullWidth size="small">
        <InputLabel id="month-filter-label">Month</InputLabel>
        <Select
          labelId="month-filter-label"
          value={tempFilters.month}
          label="Month"
          onChange={e => setTempFilters({ ...tempFilters, month: e.target.value })}
        >
          {monthOptions.map(month => (
            <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Year Filter */}
      <FormControl fullWidth size="small">
        <InputLabel id="year-filter-label">Year</InputLabel>
        <Select
          labelId="year-filter-label"
          value={tempFilters.year}
          label="Year"
          onChange={e => setTempFilters({ ...tempFilters, year: e.target.value })}
        >
          {generateYearOptions().map(year => (
            <MenuItem key={year.value} value={year.value}>{year.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* AVP Filter */}
      <FormControl fullWidth size="small" disabled={avpLoading} error={!!avpError}>
        <InputLabel id="avp-filter-label">
          Filter by AVP{avpLoading ? ' (Loading...)' : ''}
        </InputLabel>
        <Select
          labelId="avp-filter-label"
          value={tempFilters.avp}
          label={`Filter by AVP${avpLoading ? ' (Loading...)' : ''}`}
          onChange={e => setTempFilters({ ...tempFilters, avp: e.target.value })}
        >
          <MenuItem value="all">
            {avpLoading
              ? 'Loading AVP Members...'
              : avpError
              ? 'Error loading AVP Members'
              : avpUsers.length > 0
              ? `All AVP Members (${avpUsers.length} available)`
              : 'No AVP Members Found'}
          </MenuItem>
          {!avpLoading && !avpError && avpUsers.length > 0 && avpUsers.map((avp) => (
            <MenuItem key={avp._id || avp.id} value={avp._id || avp.id}>{avp.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Action Buttons */}
      <Box display="flex" alignItems="center" gap={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitFilters}
          disabled={!hasUnappliedChanges}
          sx={{ fontWeight: 600 }}
        >
          Apply
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleResetFilters}
          sx={{ fontWeight: 600 }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}
