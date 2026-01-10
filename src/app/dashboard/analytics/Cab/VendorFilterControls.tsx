import React from 'react';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';
import FormControl from '@/components/ui/Component/FormControl';
import InputLabel from '@/components/ui/Component/InputLabel';
import Select from '@/components/ui/Component/Select';
import MenuItem from '@/components/ui/Component/MenuItem';
import Button from '@/components/ui/Component/Button';
import DatePicker from '@/components/ui/Component/DatePicker';
import LocalizationProvider from '@/components/ui/Component/LocalizationProvider';
import AdapterDateFns from '@/components/ui/Component/AdapterDateFns';

export function VendorFilterControls({ tempFilters, setTempFilters, appliedFilters, avpUsers, avpLoading, avpError, handleSubmitFilters, handleResetFilters, hasUnappliedChanges }) {
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

      {/* Date Range Filter */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="From Date"
          value={tempFilters.fromDate || null}
          onChange={date => setTempFilters({ ...tempFilters, fromDate: date })}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </LocalizationProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="To Date"
          value={tempFilters.toDate || null}
          onChange={date => setTempFilters({ ...tempFilters, toDate: date })}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </LocalizationProvider>

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
