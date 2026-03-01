import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  MonitorScreen,
  EventLogScreen,
  AnalysisScreen,
  SubjectScreen,
} from '../screens';
import { colors, spacing } from '../theme';

export type RootTabParamList = {
  Monitor: undefined;
  EventLog: undefined;
  Analysis: undefined;
  Subject: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export type RootTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Monitor"
        component={MonitorScreen}
        options={{ title: 'Monitor' }}
      />
      <Tab.Screen
        name="EventLog"
        component={EventLogScreen}
        options={{ title: 'Event log' }}
      />
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{ title: 'Analysis' }}
      />
      <Tab.Screen
        name="Subject"
        component={SubjectScreen}
        options={{ title: 'Subject' }}
      />
    </Tab.Navigator>
  );
}
