import React from 'react';
import { CurrencyRupee as MuiCurrencyRupee } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface CurrencyRupeeProps extends SvgIconProps {}

const CurrencyRupee: React.FC<CurrencyRupeeProps> = (props) => {
  return <MuiCurrencyRupee {...props} />;
};

export default CurrencyRupee;
