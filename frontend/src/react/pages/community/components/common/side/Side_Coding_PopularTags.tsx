import React, { useEffect, useState } from 'react';

import {
  PopularTagsContainer,
  PopularTagsItemsBox,
  PopularTagsItem,
  PopularTagsTitle,
} from '../../../../../styles/community/Community_Components';
import { CodingEnumFilterType, LanguageType, SideCodingPopularProps } from '../../../CommunityType';

const Side_CodingPopularTags: React.FC<SideCodingPopularProps> = ({
  onEnumFilterChange,
  enumFilter,
}) => {
  const [activeEnumFilter, setActiveEnumFilter] = useState<LanguageType | null>(null);

  const handleEnumFilter = (enumFilter: LanguageType | null): void => {
    setActiveEnumFilter(enumFilter);
    onEnumFilterChange(enumFilter);
  };

  useEffect(() => {
    if (enumFilter === null) {
      setActiveEnumFilter(null);
    }
  }, [enumFilter]);

  const CodingEnumFilter: CodingEnumFilterType = {
    Java: 'JAVA',
    JavaScript: 'JS',
    Python: 'PYTHON',
    C: 'C',
    Cpp: 'CPP',
    Cs: 'CS',
    SpringBoot: 'SPB',
    React: 'RE',
    AngularJS: 'AN',
    ExpressJS: 'EX',
    NodeJS: 'NO',
    HTML: 'HTML',
    CSS: 'CSS',
  };

  return (
    <>
      <PopularTagsContainer>
        <PopularTagsTitle>🔖 인기 태그</PopularTagsTitle>
        <PopularTagsItemsBox>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.Java}
            onClick={() => handleEnumFilter(CodingEnumFilter.Java as LanguageType)}
          >
            # Java
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.JavaScript}
            onClick={() => handleEnumFilter(CodingEnumFilter.JavaScript as LanguageType)}
          >
            # JavaScript
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.Python}
            onClick={() => handleEnumFilter(CodingEnumFilter.Python as LanguageType)}
          >
            # Python
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.C}
            onClick={() => handleEnumFilter(CodingEnumFilter.C as LanguageType)}
          >
            # C
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.Cpp}
            onClick={() => handleEnumFilter(CodingEnumFilter.Cpp as LanguageType)}
          >
            # C++
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.Cs}
            onClick={() => handleEnumFilter(CodingEnumFilter.Cs as LanguageType)}
          >
            # C#
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.SpringBoot}
            onClick={() => handleEnumFilter(CodingEnumFilter.SpringBoot as LanguageType)}
          >
            # SpringBoot
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.React}
            onClick={() => handleEnumFilter(CodingEnumFilter.React as LanguageType)}
          >
            # React
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.AngularJS}
            onClick={() => handleEnumFilter(CodingEnumFilter.AngularJS as LanguageType)}
          >
            # AngularJS
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.NodeJS}
            onClick={() => handleEnumFilter(CodingEnumFilter.NodeJS as LanguageType)}
          >
            # NodeJS
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.HTML}
            onClick={() => handleEnumFilter(CodingEnumFilter.HTML as LanguageType)}
          >
            # HTML
          </PopularTagsItem>
          <PopularTagsItem
            isActive={activeEnumFilter === CodingEnumFilter.CSS}
            onClick={() => handleEnumFilter(CodingEnumFilter.CSS as LanguageType)}
          >
            # CSS
          </PopularTagsItem>
        </PopularTagsItemsBox>
      </PopularTagsContainer>
    </>
  );
};

export default Side_CodingPopularTags;
