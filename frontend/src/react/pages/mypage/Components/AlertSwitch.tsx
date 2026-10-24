import * as React from 'react';

import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { styled } from '@mui/material/styles';
import Switch, { SwitchProps } from '@mui/material/Switch';

import type { AlertSwitchProps } from '../MyPageType';

const StyledSwitch = styled((props: SwitchProps) => <Switch {...props} />)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    '&::after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));

const AlertSwtich: React.FC<AlertSwitchProps> = ({ checked, onChange }): React.JSX.Element => {
  return (
    <FormGroup
      sx={{
        display: 'flex',
        justifyContent: 'center', // 가로 중앙 정렬
        alignItems: 'center', // 세로 중앙 정렬
      }}
    >
      <FormControlLabel
        label="" // 라벨 없을 경우 레이아웃 깨짐 방지
        control={<StyledSwitch color="secondary" checked={checked} onChange={onChange} />}
        sx={{
          width: '100%', // 부모 요소에 맞게 정렬
          display: 'flex',
          justifyContent: 'center', // FormControlLabel 내부 요소도 중앙 정렬
          marginLeft: '15px',
        }}
      />
    </FormGroup>
  );
};

export default AlertSwtich;
