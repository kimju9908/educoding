import React, { useState, useEffect } from 'react';

import {
  PopularTagsContainer,
  PopularTagsItemsBox,
  PopularTagsItem,
  PopularTagsTitle,
} from '../../../../../styles/community/Community_Components';
import { SideTeamPopularProps, TeamEnumFilterType, TeamType } from '../../../CommunityType';

const Side_TeamPopularTags: React.FC<SideTeamPopularProps> = ({
  onEnumFilterChange,
  enumFilter,
}) => {
  const [activeEnumFilter, setActiveEnumFilter] = useState<TeamType | null>(null);

  const handleEnumFilter = (enumFilter: TeamType | null): void => {
    setActiveEnumFilter(enumFilter);
    onEnumFilterChange(enumFilter);
  };

  useEffect(() => {
    if (enumFilter === null) {
      setActiveEnumFilter(null);
    }
  }, [enumFilter]);

  const TeamEnumFilter: TeamEnumFilterType = {
    FrontEnd: 'FRONT',
    BackEnd: 'BACK',
    DBA: 'DBA',
    DBS: 'DBS',
    Designer: 'DESIGNER',
  };

  return (
    <>
      <PopularTagsContainer>
        <PopularTagsTitle>🔖 인기 태그</PopularTagsTitle>
        <PopularTagsItemsBox>
          <PopularTagsItem
            isActive={activeEnumFilter === TeamEnumFilter.FrontEnd}
            onClick={() => handleEnumFilter(TeamEnumFilter.FrontEnd as TeamType)}
          >
            # 프론트엔드
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === TeamEnumFilter.BackEnd}
            onClick={() => handleEnumFilter(TeamEnumFilter.BackEnd as TeamType)}
          >
            # 백엔드
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === TeamEnumFilter.DBA}
            onClick={() => handleEnumFilter(TeamEnumFilter.DBA as TeamType)}
          >
            # DBA
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === TeamEnumFilter.DBS}
            onClick={() => handleEnumFilter(TeamEnumFilter.DBS as TeamType)}
          >
            # DBS
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === TeamEnumFilter.Designer}
            onClick={() => handleEnumFilter(TeamEnumFilter.Designer as TeamType)}
          >
            # 디자이너
          </PopularTagsItem>
        </PopularTagsItemsBox>
      </PopularTagsContainer>
    </>
  );
};

export default Side_TeamPopularTags;
