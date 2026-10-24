import styled from 'styled-components';

const AcceptMT = {
  Wrap: styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--educoding-purple);
    justify-content: flex-start;
    align-items: center;
  `,

  BodyContainer: styled.div`
    width: 100%;
    height: 100%;
    padding-top: 50px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 50px;
    background-color: rgba(0, 0, 0, 0.7);
  `,

  MainBannerContainer: styled.div`
    width: 90%;
    max-width: 900px;
    height: 500px;
    display: flex;
    flex-direction: row;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    @media (max-width: 768px) {
      width: 360px;
      height: 400px;
    }
  `,

  MainBox: styled.div`
    width: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 30px;
    justify-content: center;
    align-items: center;
    padding: 0 50px;
  `,

  MainTitle: styled.div`
    color: white;
    font-family: heavy, sans-serif;
    margin-top: 50px;
    font-size: 40px;
    line-height: 140%;
    white-space: normal;
    word-wrap: break-word;
    @media (max-width: 768px) {
      font-size: 25px;
      margin-top: 0;
    }
  `,

  MainText: styled.div`
    color: white;
    font-family: regular, sans-serif;
    font-size: 14px;
    line-height: 200%;
    word-wrap: break-word;
    text-align: center;
    @media (max-width: 768px) {
      font-size: 12px;
    }
  `,
};

export default AcceptMT;
