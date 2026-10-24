import { useState } from 'react';

import { useTheme } from '@mui/material';

import {
  InputSearch,
  InputSearchBox,
  InputSearchButton,
  InputSearchContainer,
  SearchContainer,
} from '../../../../styles/admin/Admin_UserSearch';
import { UserSearchProps } from '../../AdminType';

const UserSearchBar: React.FC<UserSearchProps> = ({ onSearchChange }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const theme = useTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);
  };

  const handleSearch = (): void => {
    if (searchValue.trim() !== '') {
      onSearchChange(searchValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <SearchContainer>
        <InputSearchContainer>
          <InputSearchBox theme={theme.palette.mode}>
            <InputSearch
              autoComplete="off"
              value={searchValue}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
              placeholder="유저를 검색하세요!"
            />
          </InputSearchBox>
          <InputSearchButton onClick={handleSearch}>검색</InputSearchButton>
        </InputSearchContainer>
      </SearchContainer>
    </>
  );
};

export default UserSearchBar;
