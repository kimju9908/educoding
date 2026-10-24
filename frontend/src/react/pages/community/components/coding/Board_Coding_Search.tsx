import React, { useState } from 'react';

import { useTheme } from '@mui/material';

import {
  InputSearch,
  InputSearchBox,
  InputSearchButton,
  InputSearchContainer,
  TagSearch,
  TagSearchBox,
  TagSearchContainer,
  SearchContainer,
  ResetButtonBox,
  ResetButtonText,
  ResetButtonIcon,
  TagSearchItem,
} from '../../../../styles/community/Community_Board';
import { BoardSearchProps, LanguageType } from '../../CommunityType';
import { LanguageDisplayNames } from '../common/DisplayNames';

const Board_Coding_Search: React.FC<BoardSearchProps> = ({
  onSearchChange,
  onEnumFilterRefresh,
  enumFilter,
}) => {
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

  const enumFilterRefresh = (): void => {
    onEnumFilterRefresh();
  };

  const searchRefresh = (): void => {
    setSearchValue('');
    onSearchChange('');
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
              placeholder="궁금한 내용을 검색해보세요!"
            />
          </InputSearchBox>
          <InputSearchButton onClick={handleSearch}>검색</InputSearchButton>
        </InputSearchContainer>
        <TagSearchContainer>
          <TagSearchBox theme={theme.palette.mode}>
            <TagSearch>
              {enumFilter !== null && (
                <TagSearchItem>{LanguageDisplayNames[enumFilter as LanguageType]}</TagSearchItem>
              )}
            </TagSearch>
          </TagSearchBox>
          <ResetButtonBox
            onClick={() => {
              enumFilterRefresh();
              searchRefresh();
            }}
          >
            <ResetButtonIcon />
            <ResetButtonText>초기화</ResetButtonText>
          </ResetButtonBox>
        </TagSearchContainer>
      </SearchContainer>
    </>
  );
};

export default Board_Coding_Search;
