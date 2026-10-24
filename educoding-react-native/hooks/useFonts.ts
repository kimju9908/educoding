import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect, useState } from "react";

export default function useFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try{
      console.log("📢 폰트 로딩 시작...");
      await Asset.loadAsync([
        require("../assets/fonts/NanumSquareNeo-light.ttf"),
        require("../assets/fonts/NanumSquareNeo-regular.ttf"),
        require("../assets/fonts/NanumSquareNeo-bold.ttf"),
        require("../assets/fonts/NanumSquareNeo-extrabold.ttf"),
        require("../assets/fonts/NanumSquareNeo-heavy.ttf"),
        require("../assets/fonts/NanumSquareNeo-variable.ttf"),
      ]);
      await Font.loadAsync({
        light: require("../assets/fonts/NanumSquareNeo-light.ttf"),
        regular: require("../assets/fonts/NanumSquareNeo-regular.ttf"),
        bold: require("../assets/fonts/NanumSquareNeo-bold.ttf"),
        extrabold: require("../assets/fonts/NanumSquareNeo-extrabold.ttf"),
        heavy: require("../assets/fonts/NanumSquareNeo-heavy.ttf"),
        variable: require("../assets/fonts/NanumSquareNeo-variable.ttf"),
      });
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }
    catch (error) {
      console.error("폰트 로드 실패", error);
      setFontsLoaded(true); // 🚨 오류가 나도 앱이 멈추지 않도록 true 설정
      await SplashScreen.hideAsync(); // 🚨 스플래시 화면 강제 종료     
    }
    }
    loadFonts();
  },[]);

  return fontsLoaded;
}