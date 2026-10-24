import styled from 'styled-components';

type CarouselProps = {
  textColor?: string;
};

export const CarouselContainer = styled.div.attrs({
  id: 'carouselcontainer',
})`
  width: 100vw;
  height: 280px;
  overflow: hidden;
  transform: translate() (-100vw);
  display: flex;
  flex-direction: row;
  @media (max-width: 768px) {
    height: 400px;
  }
`;

export const CarouselOuter = styled.div.attrs({
  id: 'carouselouter',
})`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
`;

export const CarouselInner = styled.div.attrs({
  id: 'carouselinner',
})`
  width: 100%;
  max-width: 1280px;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
    padding: 20px;
    gap: 10px;
  }
`;

export const CarouselTextBox = styled.div.attrs({
  id: 'carouseltextbox',
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 10px;
  justify-content: center;
  padding-left: 10px;
  @media (max-width: 768px) {
    display: grid;
    grid-template-areas:
      'title'
      'contents'
      'arrows'; /* 모바일에서도 동일하게 배치 */
    justify-items: center;
  }
`;
export const ArrowBox = styled.div.attrs({
  id: 'arrowbox',
})`
  width: 100px;
  height: 30px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  z-index: 3;
  @media (max-width: 768px) {
    grid-area: arrows;
  }
`;

export const LeftArrow = styled.div.attrs({
  id: 'leftarrow',
})<CarouselProps>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 1px;
  padding-right: 1px;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.3);
  font-family: 'regular', sans-serif;
  font-size: 14px;
  color: ${(props) => props.textColor || 'black'};
`;

export const ArrowText = styled.div.attrs({
  id: 'arrowtext',
})`
  width: 12px;
  height: 13px;
  font-family: 'bold', sans-serif;
  font-size: 12px;
  text-align: center;
  color: white;
`;

export const ArrowSlash = styled.div.attrs({
  id: 'arrowslash',
})`
  width: 4px;
  height: 9px;
  font-family: 'bold', sans-serif;
  font-size: 8px;
  color: white;
`;

export const RightArrow = styled.div.attrs({
  id: 'rightarrow',
})<CarouselProps>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 1px;
  padding-left: 1px;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.3);
  color: ${(props) => props.textColor || 'black'};
  font-family: 'regular', sans-serif;
  font-size: 14px;
`;

export const CarouselTextTitle = styled.div.attrs({
  id: 'carouseltexttitle',
})`
  font-size: 22px;
  font-family: heavy, sans-serif;
  line-height: 30px;
  color: white;
  @media (max-width: 768px) {
    text-align: center;
    grid-area: title;
    font-size: 16px;
    line-height: 24px;
  }
`;

export const CarouselTextContents = styled.div.attrs({
  id: 'carouseltextcontentsz',
})`
  font-size: 15px;
  font-family: regular, sans-serif;
  line-height: 22px;
  color: white;
  @media (max-width: 768px) {
    text-align: center;
    grid-area: contents;
    font-size: 12px;
    line-height: 16px;
  }
`;

export const CarouselImage = styled.div.attrs({
  id: 'carouselimage',
})`
  width: 40%;
  height: 280px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: left center;
  position: relative;
  display: flex;
  @media (max-width: 768px) {
    width: 60%;
    height: 280px;
    justify-content: center;
    align-items: center;
    background-position: center;
  }
`;
