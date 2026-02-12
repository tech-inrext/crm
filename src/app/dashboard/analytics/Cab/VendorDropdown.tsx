import React from 'react';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';
import FormControl from '@/components/ui/Component/FormControl';
import InputLabel from '@/components/ui/Component/InputLabel';
import Select from '@/components/ui/Component/Select';
import MenuItem from '@/components/ui/Component/MenuItem';

export function VendorDropdown({
  vendorData,
  allVendors,
  appliedFilters,
  selectedVendor,
  setSelectedVendor
}) {
  if (!vendorData || allVendors.length === 0) return null;

  const showFiltered =
    appliedFilters.status !== 'all' ||
    appliedFilters.fromDate ||
    appliedFilters.toDate ||
    appliedFilters.avp !== 'all';

  return (
    <Box mb={1} sx={{ maxWidth: 260 }}> {/* Smaller full box */}

      {/* {showFiltered && (
        <Typography
          sx={{
            color: '#666',
            mb: 0.5,
            fontStyle: 'italic'
          }}
        >
          📌 Dropdown shows only vendors matching your applied filters
        </Typography>
      )} */}

      <FormControl fullWidth size="small"> {/* Smaller height only */}
        <InputLabel id="vendor-dropdown-label">
          {showFiltered
            ? `Filtered Vendors (${allVendors.length})`
            : 'All Vendors'}
        </InputLabel>

        <Select
          labelId="vendor-dropdown-label"
          value={selectedVendor}
          label={
            showFiltered
              ? `Filtered Vendors (${allVendors.length})`
              : 'All Vendors'
          }
          onChange={(e) => setSelectedVendor(e.target.value)}
        >
          <MenuItem value="">
            {showFiltered
              ? `Filtered Vendors (${allVendors.length})`
              : 'All Vendors'}
          </MenuItem>

          {allVendors.map((vendor, idx) => (
            <MenuItem key={vendor.id || idx} value={vendor.name}>
              {vendor.name} - {vendor.totalBookings} bookings
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
