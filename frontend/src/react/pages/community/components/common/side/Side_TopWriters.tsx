import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import CommunityApi from '../../../../../../api/AxiosApi/CommunityApi/CommunityApi';
import { TopWriterData } from '../../../../../../api/AxiosApi/CommunityApi/CommunityApiType';
import {
  TopWritersContainer,
  TopWritersTitle,
  TopWritersList,
  TopWritersEach,
  TopWritersImg,
  TopWritersId,
  TopWritersPoint,
  TopWritersProfileBox,
} from '../../../../../styles/community/Community_Components';

const TopWriters: React.FC = () => {
  const [writers, setWriters] = useState<TopWriterData[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const readTopWriters = async (): Promise<void> => {
      try {
        const response = await CommunityApi.gettopwriter();
        setWriters(response.data);
      } catch (error) {
        console.error('불러오는 중 오류 발생 : ', error);
      }
    };
    readTopWriters();
  }, []);

  const handleUserProfile = (writerKey: number): void => {
    navigate(`/community/user/${writerKey}`, {
      state: {
        writerKey,
      },
    });
  };

  return (
    <>
      <TopWritersContainer>
        <TopWritersTitle>✏️ 최다 글 작성자</TopWritersTitle>
        {writers.length > 0 ? (
          <>
            {writers.map((writer, index) => (
              <TopWritersList key={index}>
                <TopWritersEach onClick={() => handleUserProfile(writer.userKey)}>
                  <TopWritersProfileBox>
                    <TopWritersImg isProfile={writer.profileUrl} />
                    <TopWritersId>{writer.name}</TopWritersId>
                  </TopWritersProfileBox>
                  <TopWritersPoint>{writer.postCnt}</TopWritersPoint>
                </TopWritersEach>
              </TopWritersList>
            ))}
          </>
        ) : (
          <p style={{ color: 'var(--educoding-white)', margin: '20px 0' }}>
            {' '}
            최다 글 작성자가 없습니다.
          </p>
        )}
      </TopWritersContainer>
    </>
  );
};

export default TopWriters;
