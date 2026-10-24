import React, { useRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { Text } from '@/components/Themed';
import { MaterialIcons } from "@expo/vector-icons";
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import HomeScreen from './home';
import WebView from 'react-native-webview';
import { HOME_URL } from '@/constants/URL';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false
      }}>
      <Tabs.Screen
        name="exam"
        options={{
          title: '정처기',
          tabBarIcon: ({ color }) => <MaterialIcons name={"school"} size={25} color={color} />,
          tabBarLabel: ({ color }) => (
          <Text style={{ fontFamily: "extrabold", fontSize: 11, color, marginTop: 5 }}>{/* ✅ 폰트 적용 */}
          정처기
          </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="codingtest"
        options={{
          title: 'Coding Test',
          tabBarIcon: ({ color }) => <MaterialIcons name={"code"} size={25} color={color} />,
                    tabBarLabel: ({ color }) => (
          <Text style={{ fontFamily: "extrabold", fontSize: 11, color, marginTop: 5 }}>{/* ✅ 폰트 적용 */}
          코딩테스트
          </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) =>  <MaterialIcons name={"home-filled"} size={25} color={color} />,
                    tabBarLabel: ({ color }) => (
          <Text style={{ fontFamily: "extrabold", fontSize: 11, color, marginTop: 5 }}>{/* ✅ 폰트 적용 */}
          educoding 홈
          </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="mentoring"
        options={{
          title: 'Mentoring',
          tabBarIcon: ({ color }) => <MaterialIcons name={"forum"} size={25} color={color} />,
                    tabBarLabel: ({ color }) => (
          <Text style={{ fontFamily: "extrabold", fontSize: 11, color, marginTop: 5 }}>{/* ✅ 폰트 적용 */}
          멘토링
          </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이 페이지',
          tabBarIcon: ({ color }) =>  <MaterialIcons name={"person"} size={25} color={color} />,
                    tabBarLabel: ({ color }) => (
          <Text style={{ fontFamily: "extrabold", fontSize: 11, color, marginTop: 5 }}>{/* ✅ 폰트 적용 */}
          마이
          </Text>
          ),
        }}
      />
    </Tabs>
  );
}
