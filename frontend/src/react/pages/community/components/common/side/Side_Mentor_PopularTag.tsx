import React, { useState, useEffect } from 'react';

import {
  PopularTagsContainer,
  PopularTagsItemsBox,
  PopularTagsItem,
  PopularTagsTitle,
} from '../../../../../styles/community/Community_Components';
import { MentorType, SideMentorPopularProps } from '../../../CommunityType';

const Side_MentorPopularTags: React.FC<SideMentorPopularProps> = ({
  enumFilter,
  onEnumFilterChange,
}) => {
  const [activeEnumFilter, setActiveEnumFilter] = useState<MentorType | null>(null);

  const handleEnumFilter = (enumFilter: MentorType | null): void => {
    setActiveEnumFilter(enumFilter);
    onEnumFilterChange(enumFilter);
  };

  useEffect(() => {
    if (enumFilter === null) {
      setActiveEnumFilter(null);
    }
  }, [enumFilter]);

  const MentorEnumFilter = {
    PROGRAMMING: 'PROGRAMMING',
    GAME: 'GAME',
    AI: 'AI',
    SECURITY: 'SECURITY',
    DATA: 'DATA',
    HARDWARE: 'HARDWARE',
    DESIGN: 'DESIGN',
    STRATEGIC_MANAGEMENT: 'STRATEGIC_MANAGEMENT',
    MARKETING: 'MARKETING',
    SELF_DEVELOPMENT: 'SELF_DEVELOPMENT',
    NETWORK: 'NETWORK',
    ETC: 'ETC',
  };

  return (
    <>
      <PopularTagsContainer>
        <PopularTagsTitle>🔖 인기 태그</PopularTagsTitle>
        <PopularTagsItemsBox>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.PROGRAMMING}
            onClick={() => handleEnumFilter(MentorEnumFilter.PROGRAMMING as MentorType)}
          >
            # 프로그래밍
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.GAME}
            onClick={() => handleEnumFilter(MentorEnumFilter.GAME as MentorType)}
          >
            # 게임
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.AI}
            onClick={() => handleEnumFilter(MentorEnumFilter.AI as MentorType)}
          >
            # 인공지능
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.SECURITY}
            onClick={() => handleEnumFilter(MentorEnumFilter.SECURITY as MentorType)}
          >
            # 보안
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.DATA}
            onClick={() => handleEnumFilter(MentorEnumFilter.DATA as MentorType)}
          >
            # 데이터
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.HARDWARE}
            onClick={() => handleEnumFilter(MentorEnumFilter.HARDWARE as MentorType)}
          >
            # 하드웨어
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.DESIGN}
            onClick={() => handleEnumFilter(MentorEnumFilter.DESIGN as MentorType)}
          >
            # 디자인
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.STRATEGIC_MANAGEMENT}
            onClick={() => handleEnumFilter(MentorEnumFilter.STRATEGIC_MANAGEMENT as MentorType)}
          >
            # 기획경영
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.MARKETING}
            onClick={() => handleEnumFilter(MentorEnumFilter.MARKETING as MentorType)}
          >
            # 마케팅
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.SELF_DEVELOPMENT}
            onClick={() => handleEnumFilter(MentorEnumFilter.SELF_DEVELOPMENT as MentorType)}
          >
            # 자기계발
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.NETWORK}
            onClick={() => handleEnumFilter(MentorEnumFilter.NETWORK as MentorType)}
          >
            # 네트워크
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === MentorEnumFilter.ETC}
            onClick={() => handleEnumFilter(MentorEnumFilter.ETC as MentorType)}
          >
            # 기타
          </PopularTagsItem>
        </PopularTagsItemsBox>
      </PopularTagsContainer>
    </>
  );
};

export default Side_MentorPopularTags;
