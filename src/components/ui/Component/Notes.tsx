import React from 'react';
import { Notes as MuiNotes } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface NotesProps extends SvgIconProps {}

const Notes: React.FC<NotesProps> = (props) => {
  return <MuiNotes {...props} />;
};

export default Notes;