import React, { useState, useEffect } from 'react';

import {
  PopularTagsContainer,
  PopularTagsItemsBox,
  PopularTagsItem,
  PopularTagsTitle,
} from '../../../../../styles/community/Community_Components';
import { SideStudyPopularProps, StudyEnumFilterType, StudyType } from '../../../CommunityType';

const Side_StudyPopularTags: React.FC<SideStudyPopularProps> = ({
  onEnumFilterChange,
  enumFilter,
}) => {
  const [activeEnumFilter, setActiveEnumFilter] = useState<StudyType | null>(null);

  const handleEnumFilter = (enumFilter: StudyType | null): void => {
    setActiveEnumFilter(enumFilter);
    onEnumFilterChange(enumFilter);
  };

  useEffect(() => {
    if (enumFilter === null) {
      setActiveEnumFilter(null);
    }
  }, [enumFilter]);

  const StudyEnumFilter: StudyEnumFilterType = {
    Algorithm: 'ALGORITHM',
    Structure: 'STRUCTURE',
    Coding: 'CODING',
  };

  return (
    <>
      <PopularTagsContainer>
        <PopularTagsTitle>🔖 인기 태그</PopularTagsTitle>
        <PopularTagsItemsBox>
          <PopularTagsItem
            isActive={activeEnumFilter === StudyEnumFilter.Algorithm}
            onClick={() => handleEnumFilter(StudyEnumFilter.Algorithm as StudyType)}
          >
            # 알고리즘
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === StudyEnumFilter.Structure}
            onClick={() => handleEnumFilter(StudyEnumFilter.Structure as StudyType)}
          >
            # 자료구조
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === StudyEnumFilter.Coding}
            onClick={() => handleEnumFilter(StudyEnumFilter.Coding as StudyType)}
          >
            # 코딩테스트
          </PopularTagsItem>
        </PopularTagsItemsBox>
      </PopularTagsContainer>
    </>
  );
};

export default Side_StudyPopularTags;
