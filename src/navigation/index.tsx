import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  MonitorScreen,
  EventLogScreen,
  EventDetailScreen,
  AnalysisScreen,
  FilteredEventsScreen,
  SubjectScreen,
} from '../screens';
import { colors, spacing } from '../theme';
import type { SneezeEvent } from '../state/types';

export type CategoricalFilterType = 'trigger' | 'environment' | 'intervention';

export type RootTabParamList = {
  Monitor: undefined;
  EventLog: undefined;
  Analysis: undefined;
  Subject: undefined;
};

export type EventLogStackParamList = {
  EventLog: undefined;
  EventDetail: { event: SneezeEvent };
};

export type AnalysisStackParamList = {
  Analysis: undefined;
  FilteredEvents: {
    filterType: CategoricalFilterType;
    filterValue: string;
  };
  EventDetail: { event: SneezeEvent };
};

export type EventLogStackScreenProps<T extends keyof EventLogStackParamList> =
  NativeStackScreenProps<EventLogStackParamList, T>;

export type AnalysisStackScreenProps<T extends keyof AnalysisStackParamList> =
  NativeStackScreenProps<AnalysisStackParamList, T>;

const Tab = createBottomTabNavigator<RootTabParamList>();
const EventLogStack = createNativeStackNavigator<EventLogStackParamList>();
const AnalysisStack = createNativeStackNavigator<AnalysisStackParamList>();

function EventLogStackNavigator() {
  return (
    <EventLogStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <EventLogStack.Screen
        name="EventLog"
        component={EventLogScreen}
        options={{ title: 'Event log', headerShown: false }}
      />
      <EventLogStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event detail' }}
      />
    </EventLogStack.Navigator>
  );
}

function analysisFilterTitle(
  filterType: CategoricalFilterType,
  filterValue: string
): string {
  const label =
    filterType === 'trigger'
      ? 'Trigger'
      : filterType === 'environment'
        ? 'Environment'
        : 'Intervention';
  return `Events with ${label}: ${filterValue}`;
}

function AnalysisStackNavigator() {
  return (
    <AnalysisStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <AnalysisStack.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{ title: 'Analysis', headerShown: false }}
      />
      <AnalysisStack.Screen
        name="FilteredEvents"
        component={FilteredEventsScreen}
        options={({ route }) => ({
          title: analysisFilterTitle(route.params.filterType, route.params.filterValue),
        })}
      />
      <AnalysisStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event detail' }}
      />
    </AnalysisStack.Navigator>
  );
}

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
        component={EventLogStackNavigator}
        options={{ title: 'Event log', headerShown: false }}
      />
      <Tab.Screen
        name="Analysis"
        component={AnalysisStackNavigator}
        options={{ title: 'Analysis', headerShown: false }}
      />
      <Tab.Screen
        name="Subject"
        component={SubjectScreen}
        options={{ title: 'Subject' }}
      />
    </Tab.Navigator>
  );
}
