import React, { useState, useEffect } from 'react';

import {
  PopularTagsContainer,
  PopularTagsItemsBox,
  PopularTagsItem,
  PopularTagsTitle,
} from '../../../../../styles/community/Community_Components';
import { CourseEnumFilterType, CourseType, SideCoursePopularProps } from '../../../CommunityType';

const Side_CoursePopularTags: React.FC<SideCoursePopularProps> = ({
  onEnumFilterChange,
  enumFilter,
}) => {
  const [activeEnumFilter, setActiveEnumFilter] = useState<CourseType | null>(null);

  const handleEnumFilter = (enumFilter: CourseType | null): void => {
    setActiveEnumFilter(enumFilter);
    onEnumFilterChange(enumFilter);
  };

  useEffect(() => {
    if (enumFilter === null) {
      setActiveEnumFilter(null);
    }
  }, [enumFilter]);

  const CourseEnumFilter: CourseEnumFilterType = {
    Company: 'COMPANY',
    Portfolio: 'PORTFOLIO',
    Salary: 'SALARY',
    Resume: 'RESUME',
    Bootcamp: 'BOOTCAMP',
    Project: 'PROJECT',
  };

  return (
    <>
      <PopularTagsContainer>
        <PopularTagsTitle>🔖 인기 태그</PopularTagsTitle>
        <PopularTagsItemsBox>
          <PopularTagsItem
            isActive={activeEnumFilter === CourseEnumFilter.Company}
            onClick={() => handleEnumFilter(CourseEnumFilter.Company as CourseType)}
          >
            # 회사정보
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CourseEnumFilter.Portfolio}
            onClick={() => handleEnumFilter(CourseEnumFilter.Portfolio as CourseType)}
          >
            # 포트폴리오
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CourseEnumFilter.Salary}
            onClick={() => handleEnumFilter(CourseEnumFilter.Salary as CourseType)}
          >
            # 급여
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CourseEnumFilter.Resume}
            onClick={() => handleEnumFilter(CourseEnumFilter.Resume as CourseType)}
          >
            # 자기소개서
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CourseEnumFilter.Bootcamp}
            onClick={() => handleEnumFilter(CourseEnumFilter.Bootcamp as CourseType)}
          >
            # 부트캠프
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CourseEnumFilter.Project}
            onClick={() => handleEnumFilter(CourseEnumFilter.Project as CourseType)}
          >
            # 프로젝트
          </PopularTagsItem>
        </PopularTagsItemsBox>
      </PopularTagsContainer>
    </>
  );
};

export default Side_CoursePopularTags;
