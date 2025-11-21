import React from 'react';
import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { LocalizationProviderProps as MuiLocalizationProviderProps } from '@mui/x-date-pickers/LocalizationProvider';

export interface LocalizationProviderProps<TLocale = any> extends MuiLocalizationProviderProps<TLocale> {}

const LocalizationProvider = <TLocale = any>(props: LocalizationProviderProps<TLocale>) => {
  return <MuiLocalizationProvider {...props} />;
};

export default LocalizationProvider;