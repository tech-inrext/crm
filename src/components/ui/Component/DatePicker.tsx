import React from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';

export interface DatePickerProps {
  label?: string;
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  slotProps?: any;
  [key: string]: any;
}

const DatePicker: React.FC<DatePickerProps> = (props) => {
  return <MuiDatePicker {...props} />;
};

export default DatePicker;