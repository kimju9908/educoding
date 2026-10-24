import { StylesConfig } from 'react-select';

import { SelectOption } from './CsType';

export const customStyles: StylesConfig<SelectOption, true> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--educoding-dark)',
    borderColor: 'var(--educoding-white)',
    boxShadow: 'none',
    maxWidth: '1280px',
    border: 'none',
    borderBottom: '1px solid var(--educoding-line)', // 컨트롤 바에서 border-bottom 색상을 지정
    fontFamily: 'bold, sans-serif',
    fontSize: '16px',
    borderRadius: '0',
    width: '100%',
    height: '100%',
    margin: '0',
    padding: '0',
    '&:hover': {
      borderBottom: '1px solid var(--educoding-line)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    margin: '0',
    top: '38px',
    backgroundColor: 'var(--educoding-dark)',
    zIndex: '50',
    maxWidth: '1280px',
    fontSize: '12px',
    fontFamily: 'bold, sans-serif',
    color: 'var(--educoding-white)',
  }),
  option: (provided, { isSelected, isFocused }) => ({
    ...provided,
    backgroundColor: isSelected
      ? 'var(--educoding-purple)'
      : isFocused
        ? 'var(--educoding-hover)'
        : 'var(--educoding-dark)',
    color: 'var(--educoding-white)',
    cursor: 'pointer',
    zIndex: '50',
    margin: '0',
    '&:active': {
      backgroundColor: 'transparent',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'var(--educoding-hover)',
    alignItems: 'center',
    height: '100%',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'var(--educoding-white)',
    padding: '5px 10px',
    fontSize: '12px',
    fontFamily: 'bold, sans-serif',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'white',
    width: '15px',
    height: '15px',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '2px',
    marginRight: '5px',
    padding: '0',
    borderRadius: '50%',
    '&:hover': {
      backgroundColor: 'var(--educoding-white)', // hover 시 배경색 변경
      color: 'var(--educoding-black)', // hover 시 글자색 변경
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    fontFamily: 'bold, sans-serif',
    fontSize: '16px',
    color: 'var(--educoding-white)',
    opacity: '0.5',
    paddingLeft: '5px',
  }),
};
