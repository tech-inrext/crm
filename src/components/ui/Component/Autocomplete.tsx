import React from 'react';
import { Autocomplete as MuiAutocomplete } from '@mui/material';
import { AutocompleteProps as MuiAutocompleteProps } from '@mui/material/Autocomplete';

export interface AutocompleteProps<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> extends MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {}

const Autocomplete = <
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>
) => {
  return <MuiAutocomplete {...props} />;
};

export default Autocomplete;