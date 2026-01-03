import React from 'react';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export interface DateTimePickerProps {
  label?: string;
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  slotProps?: any;
  [key: string]: any;
}

const DateTimePicker: React.FC<DateTimePickerProps> = (props) => {
  return <MuiDateTimePicker {...props} />;
};

export default DateTimePicker;
