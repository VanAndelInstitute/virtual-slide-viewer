/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { html } from 'htm/react';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import FilterListIcon from '@material-ui/icons/FilterList'
import SearchIcon from '@material-ui/icons/Search';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import Zoom from '@material-ui/core/Zoom';
import Chip from '@material-ui/core/Chip';
import { useLazyQuery } from '@apollo/client';
import { GET_CASEIDS, Statuses } from './graphql/queries';

const useStyles = makeStyles((theme) => ({
  filterRoot: {
    position: 'relative',
    height: 88,
    '& .MuiTextField-root': {
      margin: theme.spacing(2),
    },
  },
  filterChips: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(3),
    },
  },
  caseSearch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 400,
    '& input': {
      transition: theme.transitions.create('width'),
      width: 100,
      '&:focus': {
        width: 220,
      },
    },
  },
  searchIcon: {
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const groupByArray = function (xs, key, tr = (x) => x) {
  return xs.reduce(function (rv, x) {
    let existing = rv.find((r) => r && r[key] === x[key]);
    if (existing) {
      existing.items.push(tr(x));
    } else {
      rv.push({ [key]: x[key], items: [tr(x)] });
    }
    return rv;
  }, []).sort((a,b) => a[key].localeCompare(b[key]));
};

export const CaseFilter = forwardRef(({onBlur, selectedCases, onChangeValue}, ref) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;
  const [fetchOptions, { data }] = useLazyQuery(GET_CASEIDS);
  const inputRef = useRef();

  useEffect(() => {
    if (loading) {
      fetchOptions();
    }
  }, [loading, fetchOptions]);

  useEffect(() => {
    if (data && loading) {
      let options = groupByArray(data.Slides.items, 'CaseID', item => item["ImageID"]);
      setOptions(options);
    }
  }, [data, loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));

  return html`
    <${Autocomplete}
      multiple
      limitTags=${2}
      filterSelectedOptions
      id="case-filter"
      value=${selectedCases}
      onChange=${onChangeValue}
      open=${open}
      onOpen=${() => {
      setOpen(true);
    }}
      onClose=${() => {
      setOpen(false);
    }}
      getOptionSelected=${(option, value) => option.CaseID === value.CaseID}
      getOptionLabel=${(option) => option.CaseID}
      options=${options}
      loading=${loading}
      renderInput=${(params) => html`
        <${TextField} ...${params} label="Case IDs" variant="outlined" margin="normal"
          inputRef=${inputRef} onBlur=${onBlur}
        />
      `}
      renderOption=${(option, { inputValue }) => {
      const matches = match(option.CaseID, inputValue);
      const parts = parse(option.CaseID, matches);

      return html`
          <div>
            ${parts.map((part, index) => html`
              <span key=${index} style=${{ fontWeight: part.highlight ? 700 : 400 }}>
                ${part.text}
              </span>
            `)}
          </div>
        `;
    }}
    />
  `;
});

export function TableFilter({ statusFilter, setCasesFilter, onFilterClick }) {
  const classes = useStyles();
  const [searching, setSearching] = useState(false);
  const [selectedCases, setSelectedCases] = useState([]);
  const searchInputRef = useRef();

  const handleSearching = () => {
    setSearching((prev) => !prev || selectedCases.length > 0);
  };

  useEffect(() => {
    if (searching) searchInputRef.current.focus();
  }, [searching]);

  useEffect(() => {
    let imageIDs = selectedCases.reduce((flat, caseID) => flat.concat(caseID.items), []);
    setCasesFilter(imageIDs);
  }, [selectedCases, setCasesFilter]);

  return html`
    <div className=${classes.filterRoot}>
      <${Zoom} in=${!searching} style=${{ transitionDelay: searching ? '0ms' : '100ms' }} appear=${false}>
        <div className=${classes.filterChips}>
          ${Statuses.map(status => html`
            <${Chip} 
              key=${status}
              color=${statusFilter === status ? 'primary' : 'default'} 
              variant=${statusFilter === status ? 'default' : 'outlined'} 
              label=${status}
              icon=${html`<${FilterListIcon} />`}
              clickable 
              onClick=${() => onFilterClick(status)}
            />
          `)}
          <${Chip}
            variant='outlined'
            label='Case Search'
            icon=${html`<${SearchIcon} />`}
            clickable
            onClick=${handleSearching} />
        </div>
      </${Zoom}>
      <${Zoom} in=${searching} style=${{ transitionDelay: searching ? '100ms' : '0ms' }}>
        <div className=${classes.caseSearch}>
          <${CaseFilter}
            selectedCases=${selectedCases}
            onChangeValue=${(event, newValue) => {
              setSelectedCases([...newValue]);
              if (newValue.length == 0) searchInputRef.current.focus();
            }}
            ref=${searchInputRef}
            onBlur=${handleSearching}
          />
        </div>
      </${Zoom}>
    </div>
  `;
}
