import { useTheme } from '@mui/material';

import Mentor_STY from '../../../../styles/community/Community_Mentor';
import { BoardMentorSearchProps } from '../../Communitu_Mentor_Interface';
import { MentorDisPlaynames } from '../common/DisplayNames';

const Board_Mentor_Search: React.FC<BoardMentorSearchProps> = ({
  searchInput,
  onSearchInput,
  onSearchButton,
  onFilterCleanButton,
  enumFilter,
}) => {
  const handleResetClick = (): void => {
    onFilterCleanButton(); // 검색 입력 및 기타 필터 초기화
  };

  const theme = useTheme();

  return (
    <>
      <Mentor_STY.SmartSearchContainer>
        <Mentor_STY.InputSearchContainer>
          <Mentor_STY.InputSearchBox theme={theme.palette.mode}>
            <Mentor_STY.InputSearch
              onChange={onSearchInput}
              value={searchInput}
              placeholder="키워드를 검색하세요"
            />
          </Mentor_STY.InputSearchBox>
          <Mentor_STY.InputSearchButton onClick={onSearchButton}>검색</Mentor_STY.InputSearchButton>
        </Mentor_STY.InputSearchContainer>
        <Mentor_STY.TagSearchContainer>
          <Mentor_STY.TagSearchBox theme={theme.palette.mode}>
            <Mentor_STY.TagSearch>
              {enumFilter !== null && (
                <Mentor_STY.TagSearchItem>
                  {MentorDisPlaynames[enumFilter]}
                </Mentor_STY.TagSearchItem>
              )}
            </Mentor_STY.TagSearch>
          </Mentor_STY.TagSearchBox>
          <Mentor_STY.ResetButtonBox onClick={handleResetClick}>
            <Mentor_STY.ResetButtonIcon />
            <Mentor_STY.ResetButtonText>초기화</Mentor_STY.ResetButtonText>
          </Mentor_STY.ResetButtonBox>
        </Mentor_STY.TagSearchContainer>
      </Mentor_STY.SmartSearchContainer>
    </>
  );
};

export default Board_Mentor_Search;
