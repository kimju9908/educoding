import { ActivityIndicator, Platform, SafeAreaView, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import React, { useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { HOME_URL } from '@/constants/URL';
import WebView from 'react-native-webview';

export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== "web" && webViewRef.current) {
        webViewRef.current.injectJavaScript(`location.href = "${HOME_URL}";`);
      }
      setLoading(false);
    },[])
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <ActivityIndicator size="large" color="#ffffff" style={styles.loading} />
      )}
      {Platform.OS === "web" ? (
        // ✅ 웹 환경에서는 iframe 사용
        <iframe
          src={HOME_URL}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      ) : (
      <WebView ref={webViewRef} onLoad={() => setLoading(false)} source={{uri: HOME_URL}}/>
      )}
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});
