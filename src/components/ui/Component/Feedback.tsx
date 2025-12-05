import React from 'react';
import { Feedback as MuiFeedback } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface FeedbackIconProps extends SvgIconProps {}

const Feedback: React.FC<FeedbackIconProps> = (props) => {
  return <MuiFeedback {...props} />;
};

export default Feedback;